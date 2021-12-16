import algosdk from 'algosdk'
import { Models, Helpers, Errors, Interfaces } from '@open-rights-exchange/chainjs'
import {
  AlgorandAddress,
  AlgoClient,
  AlgoClientIndexer,
  AlgorandBlock,
  AlgorandChainEndpoint,
  AlgorandChainInfo,
  AlgorandChainSettings,
  AlgorandChainTransactionParamsStruct,
  AlgorandSymbol,
  AlgorandTxChainResponse,
  AlgorandTxResult,
  AlgorandUnit,
} from './models'
import {
  ALGORAND_POST_CONTENT_TYPE,
  DEFAULT_BLOCKS_TO_CHECK,
  DEFAULT_GET_BLOCK_ATTEMPTS,
  DEFAULT_CHECK_INTERVAL,
  MINIMUM_CHECK_INTERVAL,
  NATIVE_CHAIN_TOKEN_SYMBOL,
} from './algoConstants'
import { toAlgo } from './helpers'
import { mapChainError } from './algoErrors'

export class AlgorandChainState implements Interfaces.ChainState {
  private _activeEndpoint: AlgorandChainEndpoint

  private _chainInfo: AlgorandChainInfo

  private _chainSettings: AlgorandChainSettings

  private _endpoints: AlgorandChainEndpoint[]

  private _isConnected: boolean = false

  private _algoClient: AlgoClient

  private _algoClientIndexer: AlgoClientIndexer

  constructor(endpoints: AlgorandChainEndpoint[], settings?: AlgorandChainSettings) {
    this._endpoints = endpoints
    this._chainSettings = settings
  }

  /** Return chain URL endpoints */
  public get activeEndpoint(): AlgorandChainEndpoint {
    return this._activeEndpoint
  }

  /** * Return chain ID */
  public get chainId(): string {
    this.assertIsConnected()
    return this._chainInfo?.nativeInfo?.transactionHeaderParams?.genesisID
  }

  /** Return chain info - e.g. head block number */
  public get chainInfo(): AlgorandChainInfo {
    this.assertIsConnected()
    return this._chainInfo
  }

  /** Return chain settings */
  public get chainSettings(): AlgorandChainSettings {
    return this._chainSettings
  }

  /** Return chain URL endpoints */
  public get endpoints(): AlgorandChainEndpoint[] {
    return this._endpoints
  }

  /** Whether any information has been retrieved from the chain yet
   *   A value here confirms that the network is working
   * */
  public get isConnected(): boolean {
    return this._isConnected
  }

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */
  public async connect(): Promise<void> {
    try {
      if (!this._algoClient) {
        const endpoint = this.selectEndpoint()
        this._activeEndpoint = endpoint
        this.assertEndpointHasTokenHeader()
        const { token, indexerUrl, url, port } = this.getAlgorandConnectionSettingsForEndpoint()
        const postToken = {
          ...token,
          ...ALGORAND_POST_CONTENT_TYPE,
        }
        this._algoClient = new algosdk.Algodv2(token, url.toString(), port)
        this._algoClientIndexer = new algosdk.Indexer(postToken, indexerUrl.toString(), port)
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      Errors.throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<Models.ChainInfo> {
    // eslint-disable-next-line no-useless-catch
    try {
      // get details from getTransactionParams endpoint
      const chainTxParams = await this._algoClient.getTransactionParams().do()
      const transactionParams: AlgorandChainTransactionParamsStruct = {
        genesisHash: chainTxParams?.genesisHash,
        genesisID: chainTxParams?.genesisID,
        firstRound: chainTxParams?.firstRound,
        lastRound: chainTxParams?.lastRound,
        minFee: null, // chainTxParams?.minFee, // NOTE: as of Aug 2021, minFee is missing from algoClient.getTransactionParams() response - we would expect it to be there
        suggestedFee: chainTxParams?.fee, // suggested fee (in microAlgos)
      }
      // get a few things from status endpoint
      const {
        'last-round': lastRound,
        'last-version': lastVersion,
        'time-since-last-round': timeSinceLastRoundInNanoSeconds,
      } = await this._algoClient.status().do()

      const timeOfLastRound = Date.now() + timeSinceLastRoundInNanoSeconds / 1000000
      this._chainInfo = {
        headBlockNumber: lastRound,
        headBlockTime: new Date(timeOfLastRound),
        // version example: 'https://github.com/algorandfoundation/specs/tree/3a83c4c743f8b17adfd73944b4319c25722a6782'
        version: lastVersion,
        nativeInfo: { transactionHeaderParams: transactionParams },
      }
      return this._chainInfo
    } catch (error) {
      const chainError = mapChainError(error)
      throw chainError
    }
  }

  public async getBlock(blockNumber: number): Promise<Partial<AlgorandBlock>> {
    this.assertIsConnected()
    const block = await this._algoClientIndexer.lookupBlock(blockNumber).do()
    return block
  }

  /** Fetches data from a contract table */
  fetchContractData(): Promise<any> {
    throw new Error('Not Implemented')
  }

  /** Fetches data from a contract table */
  fetchContractTable(): Promise<any> {
    throw new Error('Not Implemented')
  }

  /** Get the balance for an account from the chain
   *  If symbol = 'algo', returns Algo balance (in units of Algo)
   *  Else returns the asset balance of the account for the provided symbol (asset symbol),  if the symbol is valid
   *  Returns a string representation of the value to accomodate large numbers */
  public async fetchBalance(
    account: AlgorandAddress,
    symbol: AlgorandSymbol,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenAddress?: AlgorandAddress,
  ): Promise<{ balance: string }> {
    // Get balance for Algo
    if ((symbol || '').toLowerCase() === NATIVE_CHAIN_TOKEN_SYMBOL.toLowerCase()) {
      return { balance: await this.getAlgorandBalance(account) }
    }

    const balance = await this.getAssetBalance(account, symbol)
    return { balance }
  }

  /** returns balance of Algos for an account (in microalgos) */
  public async getAlgorandBalance(address: AlgorandAddress): Promise<string> {
    const accountInfo = await this._algoClientIndexer.lookupAccountByID(address).do()
    return (toAlgo(accountInfo?.account?.amount, AlgorandUnit.Microalgo) || 0).toString()
  }

  /** returns balance of a specfied asset for an account
   *  assetSymbol is the assetId */
  public async getAssetBalance(address: AlgorandAddress, assetSymbol: string): Promise<string> {
    let balance = '0'
    const accountInfo = await this._algoClientIndexer.lookupAccountByID(address).do()
    const assetId = parseInt(assetSymbol, 10)
    const { assets } = accountInfo?.account || {}
    const asset = assets.find((a: any) => a['asset-id'] === assetId)
    if (asset) {
      balance = asset?.amount || '0'
    }
    return balance
  }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      Errors.throwNewError('Not connected to chain')
    }
  }

  /** Submits the transaction to the chain and waits only until it gets a transaction id
   * Does not wait for the transaction to be finalized on the chain
   */
  async sendTransactionWithoutWaitingForConfirm(signedTransaction: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      const { txId: transactionId } = await this._algoClient
        .sendRawTransaction(Helpers.hexStringToByteArray(signedTransaction))
        .do()
      return transactionId
    } catch (error) {
      // ALGO TODO: map chain error
      throw error
    }
  }

  /** Retrieve the default settings for chain communications */
  static get defaultCommunicationSettings() {
    return {
      blocksToCheck: DEFAULT_BLOCKS_TO_CHECK,
      checkInterval: DEFAULT_CHECK_INTERVAL,
      getBlockAttempts: DEFAULT_GET_BLOCK_ATTEMPTS,
    }
  }

  /** Broadcast a signed transaction to the chain
  /* if ConfirmType.None, returns the transaction id without waiting for further tx receipt
  /* if ConfirmType.After001, waits for the transaction to finalize on chain and then returns the tx receipt
  */
  async sendTransaction(
    signedTransaction: string,
    waitForConfirm: Models.ConfirmType = Models.ConfirmType.None,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    communicationSettings?: Models.ChainSettingsCommunicationSettings,
  ): Promise<AlgorandTxResult> {
    if (waitForConfirm !== Models.ConfirmType.None && waitForConfirm !== Models.ConfirmType.After001) {
      Errors.throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }
    let sendResult: AlgorandTxResult
    let transactionId
    // eslint-disable-next-line no-useless-catch
    try {
      const { txId } = await this._algoClient.sendRawTransaction(Helpers.hexStringToByteArray(signedTransaction)).do()
      transactionId = txId
    } catch (error) {
      const chainError = mapChainError(error)
      throw chainError
    }

    if (waitForConfirm !== Models.ConfirmType.None) {
      // get the latest head block
      const { headBlockNumber: currentHeadBlock } = await this.getChainInfo()
      // Since it wont retrieve transaction response from algorand rpc (unlike EOS) it will automatically start with currentHeadBlock
      const startFromBlockNumber = currentHeadBlock

      sendResult = await this.awaitTransaction(
        { transactionId },
        waitForConfirm,
        startFromBlockNumber,
        communicationSettings,
      )
    }

    return { transactionId, ...sendResult } as AlgorandTxResult
  }

  private async awaitTransaction(
    transactionResult: AlgorandTxResult,
    waitForConfirm: Models.ConfirmType,
    startFromBlockNumber: number,
    communicationSettings: Models.ChainSettingsCommunicationSettings,
  ): Promise<AlgorandTxResult> {
    // use default communicationSettings or whatever was passed-in in as chainSettings (via constructor)
    const useCommunicationSettings = communicationSettings ?? {
      ...AlgorandChainState.defaultCommunicationSettings,
      ...this.chainSettings?.communicationSettings,
    }
    const {
      blocksToCheck,
      checkInterval: checkIntervalSetting,
      getBlockAttempts: maxBlockReadAttempts,
    } = useCommunicationSettings

    const checkInterval = this.ensureMinIntervalRetry(checkIntervalSetting)

    if (waitForConfirm !== Models.ConfirmType.None && waitForConfirm !== Models.ConfirmType.After001) {
      Errors.throwNewError(`Specified ConfirmType ${waitForConfirm} not supported`)
    }
    if (!startFromBlockNumber || startFromBlockNumber <= 1) {
      Errors.throwNewError('A valid number (greater than 1) must be provided for startFromBlockNumber param')
    }
    return new Promise((resolve, reject) => {
      const getBlockAttempt = 1
      const { transactionId } = transactionResult || {}
      // starting block number should be the block number in the transaction receipt. If block number not in transaction, use preCommitHeadBlockNum
      const nextBlockNumToCheck = startFromBlockNumber - 1

      // Schedule first call of recursive function
      // if will keep reading blocks from the chain (every checkInterval) until we find the transationId in a block
      // ... or until we reach a max number of blocks or block read attempts
      setTimeout(
        async () =>
          this.checkIfAwaitConditionsReached(
            reject,
            resolve,
            blocksToCheck,
            checkInterval,
            getBlockAttempt,
            maxBlockReadAttempts,
            nextBlockNumToCheck,
            startFromBlockNumber,
            null,
            transactionId,
            transactionResult,
            waitForConfirm,
          ),
        checkInterval,
      )
    })
  }

  /** While processing awaitTransaction, check if we've reached our limits to wait
   *  Otherwise, schedule next check  */
  private async checkIfAwaitConditionsReached(
    reject: (value?: unknown) => void,
    resolve: (value?: unknown) => void,
    blocksToCheck: number,
    checkInterval: number,
    getBlockAttempt: number,
    maxBlockReadAttempts: number,
    blockNumToCheck: number,
    startFromBlockNumber: number,
    transactionBlockNumberParam: number,
    transactionId: string,
    transactionResult: AlgorandTxResult,
    waitForConfirm: Models.ConfirmType,
  ) {
    let transactionBlockNumber = transactionBlockNumberParam
    let nextGetBlockAttempt: number
    let nextBlockNumToCheck = blockNumToCheck
    let possibleTransactionBlock: any
    let transactionResponse: AlgorandTxChainResponse
    try {
      if (!transactionBlockNumber) {
        possibleTransactionBlock = await this.getBlock(blockNumToCheck)
      }

      transactionResponse = this.findBlockInTransaction(possibleTransactionBlock, transactionId)
      if (!Helpers.isNullOrEmpty(transactionResponse)) {
        transactionBlockNumber = possibleTransactionBlock.round
      }
      // check if we've met our limit rules
      const hasReachedConfirmLevel = await this.hasReachedConfirmLevel(
        transactionBlockNumber,
        waitForConfirm,
        // blocksToCheck,
      )
      if (hasReachedConfirmLevel) {
        Errors.resolveAwaitTransaction(resolve, {
          chainResponse: transactionResponse,
          ...transactionResult,
        } as AlgorandTxResult)
        return
      }
      nextBlockNumToCheck = blockNumToCheck + 1
    } catch (error) {
      const mappedError = mapChainError(error)
      if (mappedError.errorType === Models.ChainErrorType.BlockDoesNotExist) {
        // Try to read the specific block - up to getBlockAttempts times
        if (getBlockAttempt >= maxBlockReadAttempts) {
          Errors.rejectAwaitTransaction(
            reject,
            Models.ChainErrorDetailCode.MaxBlockReadAttemptsTimeout,
            `Await Transaction Failure: Failure to find a block, after ${getBlockAttempt} attempts to check block ${blockNumToCheck}.`,
            error,
          )
          return
        }
        nextGetBlockAttempt = getBlockAttempt + 1
      } else {
        // re-throw error - not one we can handle here
        throw mappedError
      }
    }

    if (nextBlockNumToCheck && nextBlockNumToCheck > startFromBlockNumber + blocksToCheck) {
      Errors.rejectAwaitTransaction(
        reject,
        Models.ChainErrorDetailCode.ConfirmTransactionTimeout,
        `Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${
          (checkInterval / 1000) * blocksToCheck
        } seconds) starting with block num: ${startFromBlockNumber}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`,
        null,
      )
      return
    }
    // not yet reached limit - set a timer to call this function again (in checkInterval ms)
    const checkAgainInMs = checkInterval
    setTimeout(
      async () =>
        this.checkIfAwaitConditionsReached(
          reject,
          resolve,
          blocksToCheck,
          checkInterval,
          nextGetBlockAttempt,
          maxBlockReadAttempts,
          nextBlockNumToCheck,
          startFromBlockNumber,
          transactionBlockNumber,
          transactionId,
          transactionResult,
          waitForConfirm,
        ),
      checkAgainInMs,
    )
  }

  /** block has reached the confirmation level requested */
  hasReachedConfirmLevel = async (
    transactionBlockNumber: number,
    waitForConfirm: Models.ConfirmType,
    // blocksToCheck: number, Will be added with other ConfirmTypes
  ): Promise<boolean> => {
    // check that we've reached the required number of confirms
    // let lastRound: number
    // let confirmNumber: number
    switch (waitForConfirm) {
      case Models.ConfirmType.None:
        return true
      case Models.ConfirmType.After001:
        // confirmed at least once if in a block
        return !!transactionBlockNumber
      case Models.ConfirmType.After007:
        throw new Error('Not Implemented')
      case Models.ConfirmType.After010:
        throw new Error('Not Implemented')
      // ConfirmType.Final is not supported yet but a possible implementation is commented.
      case Models.ConfirmType.Final:
        throw new Error('Not Implemented')
      //   // don't have a transactionBlockNumber yet
      //   if (!transactionBlockNumber) return false
      //   lastRound = (await this.getChainInfo())?.nativeInfo?.transactionHeaderParams?.lastRound
      //   // check if blocksToCheck allows us to read enough blocks to get to final confirm
      //   confirmNumber = lastRound - transactionBlockNumber
      //   return confirmNumber >= blocksToCheck
      default:
        return false
    }
  }

  /** Return a transaction if its included in a block */
  public findBlockInTransaction(block: Partial<AlgorandBlock>, transactionId: string): AlgorandTxChainResponse {
    const { transactions } = block
    const result = transactions?.find((transaction: any) => transaction?.id === transactionId)
    return result
  }

  /** Return instance of algo sdk */
  public get algoClient(): AlgoClient {
    this.assertIsConnected()
    return this._algoClient
  }

  /** Return instance of algo sdk for sending transactions
   * Includes content-type: 'application/x-binary' in the header
   */
  public get algoClientIndexer(): AlgoClientIndexer {
    this.assertIsConnected()
    return this._algoClientIndexer
  }

  /** Searched transaction on chain by id
   * Throws if transaction does not exsits (this includes invalid id)
   */
  public async getTransactionById(id: string): Promise<any> {
    let transaction
    try {
      transaction = await this.algoClientIndexer.lookupTransactionByID(id).do()
    } catch (error) {
      throw new Errors.ChainError(Models.ChainErrorType.TxNotFoundOnChain, 'Transaction Not Found', null, error)
    }
    return transaction
  }

  /** Gets an executed or pending transaction (by transaction hash)
   * A transction that has enough fees will appear on the chain and quickly be confirmed
   * Until the transaction is processed by the chain, this function will throw a TxNotFoundOnChain chain error
   */
  public async fetchTransaction(
    transactionId: string,
  ): Promise<{ status: Models.TransactionStatus; transaction: any }> {
    const transactionResponse = await this.getTransactionById(transactionId)
    // TODO: Type the transaction response - which wraps this unfinished type: AlgorandTxFromChain
    const { 'confirmed-round': confirmedRound, 'last-valid': lastValid } = transactionResponse.transaction
    const { 'current-round': currentRound } = transactionResponse
    let status: Models.TransactionStatus
    if (confirmedRound) {
      status = Models.TransactionStatus.Executed
    } else {
      const isExpired = currentRound > lastValid
      status = isExpired ? Models.TransactionStatus.Dead : Models.TransactionStatus.Pending
    }
    return { status, transaction: transactionResponse.transaction }
  }

  /** Gets the minimum fee (microalgo) used by any transaction
   * Fee per byte can fall to 0, but the minimum fee is required */
  public get minimumFeePerTx(): number {
    return this._chainInfo?.nativeInfo?.transactionHeaderParams?.minFee
  }

  /** Gets recommented fee (microalgo) per byte according to network's transaction load */
  public get suggestedFeePerByte(): number {
    return this._chainInfo?.nativeInfo?.transactionHeaderParams?.suggestedFee
  }

  /** Checks for required header 'X-API_key' */
  private assertEndpointHasTokenHeader(): void {
    if (!Helpers.getHeaderValueFromEndpoint(this._activeEndpoint, 'x-api-key')) {
      Errors.throwNewError('x-api-key header is required to call algorand endpoint')
    }
  }

  private getAlgorandConnectionSettingsForEndpoint() {
    const endpointUrl = new URL(Helpers.trimTrailingChars(this.activeEndpoint?.url, '/'))
    const indexerUrl = new URL(Helpers.trimTrailingChars(this.activeEndpoint?.options?.indexerUrl, '/'))
    const token = Helpers.getHeaderValueFromEndpoint(this._activeEndpoint, 'x-api-key')

    return {
      url: endpointUrl,
      indexerUrl,
      token,
      port: endpointUrl?.port,
    }
  }

  // TODO: sort based on health info
  /**  * Choose the best Chain endpoint based on health and response time */
  private selectEndpoint(): AlgorandChainEndpoint {
    // Just choose the first endpoint for now
    const endpoint = this.endpoints[0] as AlgorandChainEndpoint
    return endpoint
  }

  /** Ensure that the timeout between requests have a mimimum amount of wait */
  private ensureMinIntervalRetry(intervalParam: number) {
    let checkInterval = intervalParam || 0
    if (intervalParam < MINIMUM_CHECK_INTERVAL) {
      checkInterval = MINIMUM_CHECK_INTERVAL
    }
    return checkInterval
  }
}
