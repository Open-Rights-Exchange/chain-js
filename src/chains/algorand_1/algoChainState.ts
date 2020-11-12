import algosdk from 'algosdk'
import { throwAndLogError, throwNewError } from '../../errors'
import { ChainEndpoint, ChainErrorDetailCode, ChainErrorType, ChainInfo, ConfirmType } from '../../models'
import {
  AlgorandAddress,
  AlgoClient,
  AlgorandChainEndpoint,
  AlgorandChainInfo,
  AlgorandChainSettings,
  AlgorandChainSettingsCommunicationSettings,
  AlgorandChainTransactionParamsStruct,
  AlgorandHeader,
  AlgorandSymbol,
  AlgorandTxResult,
  AlgorandUnit,
  AlgorandTxChainResponse,
} from './models'
import {
  getHeaderValueFromEndpoint,
  hexStringToByteArray,
  isNullOrEmpty,
  objectHasProperty,
  rejectAwaitTransaction,
  resolveAwaitTransaction,
  trimTrailingChars,
} from '../../helpers'
import {
  ALGORAND_POST_CONTENT_TYPE,
  DEFAULT_BLOCKS_TO_CHECK,
  DEFAULT_GET_BLOCK_ATTEMPTS,
  DEFAULT_CHECK_INTERVAL,
  NATIVE_CHAIN_TOKEN_SYMBOL,
} from './algoConstants'
import { toAlgo } from './helpers'
import { mapChainError } from './algoErrors'

export class AlgorandChainState {
  private _activeEndpoint: ChainEndpoint

  private _chainInfo: AlgorandChainInfo

  private _chainSettings: AlgorandChainSettings

  private _endpoints: ChainEndpoint[]

  private _isConnected: boolean = false

  private _algoClient: AlgoClient

  private _algoClientWithTxHeader: AlgoClient

  constructor(endpoints: ChainEndpoint[], settings?: AlgorandChainSettings) {
    this._endpoints = endpoints
    this._chainSettings = settings
  }

  /** Return chain URL endpoints */
  public get activeEndpoint(): ChainEndpoint {
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
  public get endpoints(): ChainEndpoint[] {
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
        const { endpoint } = this.selectEndpoint()
        this._activeEndpoint = endpoint
        this.assertEndpointHasTokenHeader()
        const { token, url, port } = this.getAlgorandConnectionSettingsForEndpoint()
        const postToken = {
          ...token,
          ...ALGORAND_POST_CONTENT_TYPE,
        }
        this._algoClient = new algosdk.Algod(token, url, port)
        this._algoClientWithTxHeader = new algosdk.Algod(postToken, url, port)
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<ChainInfo> {
    // eslint-disable-next-line no-useless-catch
    try {
      const transactionHeaderParams: AlgorandChainTransactionParamsStruct = await this._algoClient.getTransactionParams()
      const { lastRound, consensusVersion } = transactionHeaderParams
      const { timestamp } = await this._algoClient.block(lastRound)
      this._chainInfo = {
        headBlockNumber: lastRound,
        headBlockTime: new Date(timestamp),
        // version example: 'https://github.com/algorandfoundation/specs/tree/e5f565421d720c6f75cdd186f7098495caf9101f'
        version: consensusVersion.toString(),
        nativeInfo: { transactionHeaderParams },
      }
      return this._chainInfo
    } catch (error) {
      // ALGO TODO: map chain error
      throw error
    }
  }

  public async getBlock(blockNumber: number): Promise<any> {
    this.assertIsConnected()
    const block = await this._algoClient.block(blockNumber)
    return block
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
    return { balance: balance || '0' }
  }

  /** Utilizes native algosdk method to get Algo token balance for an account (in microalgos) */
  public async getAlgorandBalance(address: AlgorandAddress): Promise<string> {
    const accountInfo = await this._algoClient.accountInformation(address)
    return toAlgo(accountInfo?.amount, AlgorandUnit.Microalgo).toString()
  }

  /** Utilizes native algosdk method to get Algo token balance for an account (in microalgos) */
  public async getAssetBalance(address: AlgorandAddress, assetSymbol: string): Promise<string> {
    const accountInfo = await this._algoClient.accountInformation(address)
    const { assets } = accountInfo || {}
    if (!isNullOrEmpty(assets) && objectHasProperty(assets, assetSymbol)) {
      return assets[assetSymbol]?.amount
    }
    return null
  }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Submits the transaction to the chain and waits only until it gets a transaction id
   * Does not wait for the transaction to be finalized on the chain
   */
  async sendTransactionWithoutWaitingForConfirm(signedTransaction: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      const { txId: transactionId } = await this._algoClientWithTxHeader.sendRawTransaction(
        hexStringToByteArray(signedTransaction),
      )
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
    waitForConfirm: ConfirmType = ConfirmType.None,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    communicationSettings?: AlgorandChainSettingsCommunicationSettings,
  ): Promise<AlgorandTxResult> {
    if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }
    let sendResult: AlgorandTxResult
    let transactionId
    // get the head block just before sending the transaction
    const { headBlockNumber: currentHeadBlock } = await this.getChainInfo()
    // eslint-disable-next-line no-useless-catch
    try {
      const { txId } = await this._algoClientWithTxHeader.sendRawTransaction(hexStringToByteArray(signedTransaction))
      transactionId = txId
    } catch (error) {
      const chainError = mapChainError(error)
      throw chainError
    }

    if (waitForConfirm !== ConfirmType.None) {
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
    waitForConfirm: ConfirmType,
    startFromBlockNumber: number,
    communicationSettings: AlgorandChainSettingsCommunicationSettings,
  ): Promise<AlgorandTxResult> {
    // use default communicationSettings or whatever was passed-in in as chainSettings (via constructor)
    const useCommunicationSettings = communicationSettings ?? {
      ...AlgorandChainState.defaultCommunicationSettings,
      ...this.chainSettings?.communicationSettings,
    }
    const { blocksToCheck, checkInterval, getBlockAttempts: maxBlockReadAttempts } = useCommunicationSettings
    if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
      throwNewError(`Specified ConfirmType ${waitForConfirm} not supported`)
    }
    if (!startFromBlockNumber || startFromBlockNumber <= 1) {
      throwNewError('A valid number (greater than 1) must be provided for startFromBlockNumber param')
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
    waitForConfirm: ConfirmType,
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

      transactionResponse = this.blockHasTransaction(possibleTransactionBlock, transactionId)
      if (!isNullOrEmpty(transactionResponse)) {
        transactionBlockNumber = possibleTransactionBlock.round
      }
      // check if we've met our limit rules
      const hasReachedConfirmLevel = await this.hasReachedConfirmLevel(
        transactionBlockNumber,
        waitForConfirm,
        // blocksToCheck,
      )
      if (hasReachedConfirmLevel) {
        resolveAwaitTransaction(resolve, {
          chainResponse: transactionResponse,
          ...transactionResult,
        } as AlgorandTxResult)
        return
      }
      nextBlockNumToCheck = blockNumToCheck + 1
    } catch (error) {
      const mappedError = mapChainError(error)
      if (mappedError.errorType === ChainErrorType.BlockDoesNotExist) {
        // Try to read the specific block - up to getBlockAttempts times
        if (getBlockAttempt >= maxBlockReadAttempts) {
          rejectAwaitTransaction(
            reject,
            ChainErrorDetailCode.MaxBlockReadAttemptsTimeout,
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
      rejectAwaitTransaction(
        reject,
        ChainErrorDetailCode.ConfirmTransactionTimeout,
        `Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${(checkInterval / 1000) *
          blocksToCheck} seconds) starting with block num: ${startFromBlockNumber}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`,
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
    waitForConfirm: ConfirmType,
    // blocksToCheck: number, Will be added with other ConfirmTypes
  ): Promise<boolean> => {
    // check that we've reached the required number of confirms
    // let lastRound: number
    // let confirmNumber: number
    switch (waitForConfirm) {
      case ConfirmType.None:
        return true
      case ConfirmType.After001:
        // confirmed at least once if in a block
        return !!transactionBlockNumber
      case ConfirmType.After007:
        throw new Error('Not Implemented')
      case ConfirmType.After010:
        throw new Error('Not Implemented')
      // ConfirmType.Final is not supported yet but a possible implementation is commented.
      case ConfirmType.Final:
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

  /** Check if a block includes a transaction */
  public blockHasTransaction = (block: any, transactionId: string): AlgorandTxChainResponse => {
    const { transactions } = block?.txns
    const result = transactions?.find((transaction: any) => transaction?.tx === transactionId)
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
  public get algoClientWithTxHeader(): AlgoClient {
    this.assertIsConnected()
    return this._algoClientWithTxHeader
  }

  /** Searched transaction on chain by id
   * Returns null if transaction does not exsits (this includes invalid id)
   */
  public async getTransactionById(id: string): Promise<any> {
    let transaction
    try {
      transaction = this.algoClient.transactionById(id)
    } catch (error) {
      return null
    }
    return transaction
  }

  /** Gets recommented fee (microalgo) per byte according to network's transaction load */
  public async getSuggestedFeePerByte(): Promise<number> {
    const { fee } = await this.algoClient.suggestedFee()
    return fee
  }

  /** Checks for required header 'X-API_key' */
  private assertEndpointHasTokenHeader(): void {
    if (!getHeaderValueFromEndpoint(this._activeEndpoint, 'X-API-Key')) {
      throwNewError('X-API-Key header is required to call algorand endpoint')
    }
  }

  /** returns the 'X-API-Key' header required to call algorand chain endpoint */
  private getTokenFromEndpointHeader(): AlgorandHeader {
    const token = getHeaderValueFromEndpoint(this._activeEndpoint, 'X-API-Key')
    if (isNullOrEmpty(token)) {
      return null
    }
    return token
  }

  private getAlgorandConnectionSettingsForEndpoint() {
    const { url } = this._activeEndpoint
    const { port = '' } = url
    const token = this.getTokenFromEndpointHeader()
    return { url, token, port }
  }

  // TODO: sort based on health info
  /**  * Choose the best Chain endpoint based on health and response time */
  private selectEndpoint(): { url: URL; endpoint: AlgorandChainEndpoint } {
    // Just choose the first endpoint for now
    const endpoint = this.endpoints[0]
    const url = endpoint?.url?.href
    return { url: new URL(trimTrailingChars(url, '/')), endpoint }
  }
}
