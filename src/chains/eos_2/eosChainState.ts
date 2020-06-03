import { Api, JsonRpc, RpcInterfaces } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig' // development only
import nodeFetch from 'node-fetch' // node only; not needed in browsers
import { TextEncoder, TextDecoder } from 'util' // for node only; native TextEncoder/Decoder
import { ChainError, throwNewError, throwAndLogError } from '../../errors'
import { ChainInfo, ChainEndpoint, ConfirmType, ChainErrorType, ChainErrorDetailCode } from '../../models'
import { trimTrailingChars, isNullOrEmpty } from '../../helpers'
import {
  EosSignature,
  EosEntityName,
  EOSGetTableRowsParams,
  EosChainSettings,
  EosChainSettingsCommunicationSettings,
  EosTxResult,
} from './models'
import { mapChainError } from './eosErrors'
import {
  CHAIN_BLOCK_FREQUENCY,
  DEFAULT_BLOCKS_TO_CHECK,
  DEFAULT_GET_BLOCK_ATTEMPTS,
  DEFAULT_CHECK_INTERVAL,
  DEFAULT_TRANSACTION_BLOCKS_BEHIND_REF_BLOCK,
  DEFAULT_TRANSACTION_EXPIRY_IN_SECONDS,
} from './eosConstants'

export class EosChainState {
  private eosChainInfo: RpcInterfaces.GetInfoResult

  private _activeEndpoint: ChainEndpoint

  private _chainInfo: ChainInfo

  private _chainSettings: EosChainSettings

  private _endpoints: ChainEndpoint[]

  private _isConnected: boolean = false

  private _signatureProvider: JsSignatureProvider

  private _rpc: JsonRpc // EOSJS chain RPC endpoint

  private _api: Api // EOSJS chain API endpoint

  constructor(endpoints: ChainEndpoint[], settings?: EosChainSettings) {
    this._endpoints = endpoints
    // TODO chainjs check for valid settings and throw if bad
    this._chainSettings = this.applyDefaultSettings(settings)
  }

  /** apply default value - override defaults with incoming settings */
  private applyDefaultSettings = (settings?: EosChainSettings): EosChainSettings => {
    return {
      ...settings,
      communicationSettings: {
        blocksToCheck: DEFAULT_BLOCKS_TO_CHECK,
        checkInterval: DEFAULT_CHECK_INTERVAL,
        getBlockAttempts: DEFAULT_GET_BLOCK_ATTEMPTS,
        ...settings?.communicationSettings,
      },
      defaultTransactionSettings: {
        blocksBehind: DEFAULT_TRANSACTION_BLOCKS_BEHIND_REF_BLOCK,
        expireSeconds: DEFAULT_TRANSACTION_EXPIRY_IN_SECONDS,
        ...settings?.defaultTransactionSettings,
      },
    }
  }

  /** Return chain URL endpoints */
  public get activeEndpoint(): ChainEndpoint {
    return this._activeEndpoint
  }

  /** Return chain ID */
  public get chainId(): string {
    this.assertIsConnected()
    return this._chainInfo?.nativeInfo?.chain_id
  }

  /** Return chain info - e.g. head block number */
  public get chainInfo(): ChainInfo {
    this.assertIsConnected()
    return this._chainInfo
  }

  /** Return chain settings */
  public get chainSettings(): EosChainSettings {
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

  /** Return instance of EOSJS API */
  public get api(): Api {
    this.assertIsConnected()
    return this._api
  }

  /** Return instance of EOSJS JsonRpc */
  public get rpc(): JsonRpc {
    this.assertIsConnected()
    return this._rpc
  }

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */

  public async connect(): Promise<void> {
    try {
      // we don't store keys in chain state so JsSignatureProvider keys are empty
      this._signatureProvider = new JsSignatureProvider([])
      if (!this._rpc) {
        const url = this.determineUrl()
        this._rpc = new JsonRpc(url, { fetch: this._chainSettings?.fetch || nodeFetch })
      }
      if (!this._api) {
        this._api = new Api({
          rpc: this._rpc,
          signatureProvider: this._signatureProvider,
          textDecoder: new TextDecoder(),
          textEncoder: new TextEncoder(),
        })
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<RpcInterfaces.GetInfoResult> {
    const info = await this._rpc.get_info()
    this.eosChainInfo = info
    const { head_block_num: headBlockNumber, head_block_time: headBlockTime, server_version: version } = info
    this._chainInfo = {
      headBlockNumber,
      headBlockTime: new Date(headBlockTime),
      version,
      nativeInfo: info,
    }
    return info
  }

  // TODO: sort based on health info
  /** Choose the best Chain endpoint based on health and response time */
  private determineUrl(): string {
    // Allow 'empty' list of endpoints - the fetch module might have its own approach for providing urls
    if (isNullOrEmpty(this.endpoints)) {
      return ''
    }
    const url = this.endpoints[0]?.url?.href
    return trimTrailingChars(url, '/')
  }

  /** Retrieve a specific block from the chain */
  public async getBlock(blockNumber: number): Promise<RpcInterfaces.GetBlockResult> {
    this.assertIsConnected()
    const block = await this._rpc.get_block(blockNumber)
    return block
  }

  static get defaultEOSGetTableRowsParams(): Partial<EOSGetTableRowsParams> {
    return {
      index_position: 1,
      key_type: 'i64',
      limit: -1,
      lower_bound: 0,
      reverse: false,
      show_payer: false,
      upper_bound: -1,
      json: true,
    }
  }

  /** Generic wrapper that in turn calls EOS get_table_rows to fetch data from a contract table */
  public async fetchContractData(
    contract: EosEntityName,
    table: string,
    owner: EosEntityName,
    indexNumber: number,
    lowerRow: number,
    upperRow: number,
    limit: number,
    reverseOrder: boolean,
    showPayer: boolean,
    keyType: string,
  ): Promise<any> {
    this.assertIsConnected()
    const params = {
      code: contract,
      key_type: keyType,
      index_position: indexNumber,
      limit,
      lower_bound: lowerRow,
      scope: owner,
      reverse: reverseOrder,
      show_payer: showPayer,
      table,
      upper_bound: upperRow,
      ...(EosChainState.defaultEOSGetTableRowsParams as EOSGetTableRowsParams),
    }
    return this.fetchContractTable(params)
  }

  /** Calls EOS get_table_rows to fetch data from a contract table */
  public async fetchContractTable(params: EOSGetTableRowsParams): Promise<any> {
    const results = await this.rpc.get_table_rows(params)
    return results
  }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Check if a block includes a transaction */
  public blockHasTransaction = (block: any, transactionId: string): boolean => {
    const { transactions } = block
    const result = transactions?.find((transaction: any) => transaction?.trx?.id === transactionId)
    return !!result
  }

  /** Retrieve the default settings for chain communications */
  static get defaultCommunicationSettings() {
    return {
      blocksToCheck: DEFAULT_BLOCKS_TO_CHECK,
      checkInterval: DEFAULT_CHECK_INTERVAL,
      getBlockAttempts: DEFAULT_GET_BLOCK_ATTEMPTS,
    }
  }

  /** Broadcast a signed transaction to the chain */
  async sendTransaction(
    serializedTransaction: any,
    signatures: EosSignature[],
    waitForConfirm: ConfirmType = ConfirmType.None,
    communicationSettings?: EosChainSettingsCommunicationSettings,
  ): Promise<EosTxResult> {
    if (
      waitForConfirm !== ConfirmType.None &&
      waitForConfirm !== ConfirmType.After001 &&
      waitForConfirm !== ConfirmType.Final
    ) {
      throwNewError('EOS plugin only supports ConfirmType.None, .After001, and .Final')
    }

    const signedTransaction = { signatures, serializedTransaction }
    // payload to return from this function
    const sendResult: Partial<EosTxResult> = {}

    // get the head block just before sending the transaction
    const currentHeadBlock = await this.getChainInfo()
    try {
      sendResult.chainResponse = await this.rpc.push_transaction(signedTransaction)
      sendResult.transactionId = sendResult.chainResponse?.transaction_id
    } catch (error) {
      const chainError = mapChainError(error)
      throw chainError
    }

    if (waitForConfirm !== ConfirmType.None) {
      // starting block number should be the block number in the transaction receipt
      // ...if it doesnt have one (which can happen), get the latest head block from the chain via get info
      let startFromBlockNumber = sendResult?.chainResponse?.processed?.block_num
      if (!startFromBlockNumber) {
        startFromBlockNumber = currentHeadBlock
      }
      await this.awaitTransaction(
        sendResult as EosTxResult,
        waitForConfirm,
        startFromBlockNumber,
        communicationSettings,
      )
    }
    return sendResult as EosTxResult
  }

  /** Polls the chain until it finds a block that includes the specific transaction
        Useful when committing sequential transactions with inter-dependencies (must wait for the first one to commit before submitting the next one)
        transactionResult: The value return to the function calling sendTransaction() - includes response body from submitting the transaction to the chain and transactionId
        waitForConfirm an enum that specifies how long to wait before 'confirming transaction' and resolving the promise with the tranasction results
        startFromBlockNumber = first block to start looking for the transaction to appear in
        blocksToCheck = the number of blocks to check, after committing the transaction, before giving up
        checkInterval = the time between block checks in MS
        getBlockAttempts = the number of failed attempts at retrieving a particular block, before giving up
  */
  private async awaitTransaction(
    transactionResult: EosTxResult,
    waitForConfirm: ConfirmType,
    startFromBlockNumber: number,
    communicationSettings: EosChainSettingsCommunicationSettings,
  ) {
    // use default communicationSettings or whatever was passed-in in as chainSettings (via constructor)
    const useCommunicationSettings = communicationSettings ?? {
      ...EosChainState.defaultCommunicationSettings,
      ...this.chainSettings?.communicationSettings,
    }
    const { blocksToCheck, checkInterval, getBlockAttempts: maxBlockReadAttempts } = useCommunicationSettings

    if (
      waitForConfirm !== ConfirmType.None &&
      waitForConfirm !== ConfirmType.After001 &&
      waitForConfirm !== ConfirmType.Final
    ) {
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
    transactionResult: EosTxResult,
    waitForConfirm: ConfirmType,
  ) {
    let transactionBlockNumber = transactionBlockNumberParam
    let nextGetBlockAttempt: number
    let nextBlockNumToCheck: number
    let possibleTransactionBlock: RpcInterfaces.GetBlockResult
    // let transactionHistoryRecord: any
    try {
      // attempt to get the transaction from the history plug-in - only supported by some block producers
      // try {
      //   // we only need to get the history record if we dont yet know what block the tx is in
      //   if (!transactionBlockNumber) {
      //     transactionHistoryRecord = await this.rpc.history_get_transaction(transactionId)
      //     transactionBlockNumber = transactionHistoryRecord?.block_num
      //   }
      // } catch (error) {
      //   // if can't find - RpcError.json.code = 500 RpcError.json.error.name = 'tx_not_found' //
      //   // if no history plug-in - 404
      //   // do nothing - EOS endpoint doesnt have history plug-in installed or transactionId can't be found
      // }

      // if we cant get the transaction, read the next block and check if it has our transaction
      if (!transactionBlockNumber) {
        possibleTransactionBlock = await this.rpc.get_block(blockNumToCheck)
        if (this.blockHasTransaction(possibleTransactionBlock, transactionId)) {
          transactionBlockNumber = possibleTransactionBlock.block_num
        }
      }
      // check if we've met our limit rules
      const hasReachedConfirmLevel = await this.hasReachedConfirmLevel(
        transactionBlockNumber,
        waitForConfirm,
        blocksToCheck,
      )
      if (hasReachedConfirmLevel) {
        this.resolveAwaitTransaction(resolve, transactionResult)
        return
      }
      nextBlockNumToCheck = blockNumToCheck + 1
    } catch (error) {
      const mappedError = mapChainError(error)
      if (mappedError.errorType === ChainErrorType.BlockDoesNotExist) {
        // Try to read the specific block - up to getBlockAttempts times
        if (getBlockAttempt >= maxBlockReadAttempts) {
          this.rejectAwaitTransaction(
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
      this.rejectAwaitTransaction(
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
    blocksToCheck: number,
  ): Promise<boolean> => {
    // check that we've reached the required number of confirms
    let lastIrreversibleBlockNum: number
    let blocksTillIrreversible: number
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
      // ConfirmType.Final might be impractical to use - could wait for 2mins on EOS chain
      case ConfirmType.Final:
        // don't have a transactionBlockNumber yet
        if (!transactionBlockNumber) return false
        lastIrreversibleBlockNum = (await this.getChainInfo())?.last_irreversible_block_num
        // check if blocksToCheck allows us to read enough blocks to get to final confirm
        blocksTillIrreversible = transactionBlockNumber - lastIrreversibleBlockNum
        if (blocksTillIrreversible > blocksToCheck) {
          throw new Error(
            `Process will 'time-out' before reaching final confirmation. It would take ${blocksTillIrreversible} blocks to get to the lastIrreversibleBlock (taking ${blocksTillIrreversible *
              CHAIN_BLOCK_FREQUENCY} seconds) but blocksToCheck setting is only ${blocksToCheck}. To use ConfirmType.Final (which is not recommended), increase communicationsSettings.blocksToCheck to be at least ${blocksTillIrreversible}`,
          )
        }
        return transactionBlockNumber <= lastIrreversibleBlockNum
      default:
        return false
    }
  }

  resolveAwaitTransaction = (resolve: any, transaction: any) => {
    resolve(transaction)
  }

  /** All errors are of ErrorType TxConfirmFailure
   *  A more specfic cause of the error is passed via errorDetailCode param
   */
  rejectAwaitTransaction = (
    reject: any,
    errorDetailCode: ChainErrorDetailCode,
    errorMessage: string,
    originalError: Error,
  ) => {
    const error = new ChainError(ChainErrorType.TxConfirmFailure, errorMessage, { errorDetailCode }, originalError)
    reject(error)
  }

  /** Access to underlying eosjs principals
   *  Warning! You should not write code to these interface is you can use the chainjs functions instead
   *  These are provided as an escape hatch just in case
   */
  get eosjs() {
    return {
      api: this._api,
      jsonRpc: this.rpc,
    }
  }
}
