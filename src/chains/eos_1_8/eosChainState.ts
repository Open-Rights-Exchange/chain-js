import { Api, JsonRpc, RpcInterfaces } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig' // development only
import nodeFetch from 'node-fetch' // node only; not needed in browsers
import { TextEncoder, TextDecoder } from 'util' // for node only; native TextEncoder/Decoder
import { throwNewError, throwAndLogError } from '../../errors'
import { ChainInfo, ChainEndpoint, ChainSettings, ConfirmType } from '../../models'
import { trimTrailingChars, isNullOrEmpty } from '../../helpers'
import { EosSignature, EosEntityName, EOSGetTableRowsParams } from './models'
import { mapChainError } from './eosErrors'
import { DEFAULT_BLOCKS_TO_CHECK, DEFAULT_GET_BLOCK_ATTEMPTS, DEFAULT_CHECK_INTERVAL } from './eosConstants'

export class EosChainState {
  private eosChainInfo: RpcInterfaces.GetInfoResult

  private _activeEndpoint: ChainEndpoint

  private _chainInfo: ChainInfo

  private _chainSettings: ChainSettings

  private _endpoints: ChainEndpoint[]

  private _isConnected: boolean = false

  private _signatureProvider: JsSignatureProvider

  private _rpc: JsonRpc // EOSJS chain RPC endpoint

  private _api: Api // EOSJS chain API endpoint

  constructor(endpoints: ChainEndpoint[], settings?: ChainSettings) {
    // TODO chainjs check for valid settings and throw if bad
    this._endpoints = endpoints
    // TODO chainjs check for valid settings and throw if bad
    this._chainSettings = settings
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
  public get chainSettings(): ChainSettings {
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

  /** Retrieve a specific block from the chain */
  public blockHasTransaction = (block: any, transactionId: number): boolean => {
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
    waitForConfirm?: ConfirmType,
    communicationSettings?: any,
  ) {
    // Default confirm to not wait for any block confirmations
    const useWaitForConfirm = waitForConfirm ?? ConfirmType.None

    if (useWaitForConfirm !== ConfirmType.None && useWaitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }

    const signedTransaction = { signatures, serializedTransaction }
    let sendReceipt

    // get the head block just before sending the transaction
    const currentHeadBlock = await this.getChainInfo()
    try {
      sendReceipt = await this.rpc.push_transaction(signedTransaction)
    } catch (error) {
      const chainError = mapChainError(error)
      throw chainError
    }

    if (useWaitForConfirm !== ConfirmType.None) {
      // starting block number should be the block number in the transaction receipt
      // ...if it doesnt have one (which can happen), get the latest head block from the chain via get info
      let startFromBlockNumber = sendReceipt?.processed?.block_num
      if (!startFromBlockNumber) {
        startFromBlockNumber = currentHeadBlock
      }
      await this.awaitTransaction(sendReceipt, useWaitForConfirm, startFromBlockNumber, communicationSettings)
    }
    return sendReceipt
  }

  /** Polls the chain until it finds a block that includes the specific transaction
        Useful when committing sequential transactions with inter-dependencies (must wait for the first one to commit before submitting the next one)
        transactionResponse: The response body from submitting the transaction to the chain (includes transaction Id and most recent chain block number)
        waitForConfirm an enum that specifies how long to wait before 'confirming transaction' and resolving the promise with the tranasction results
        startFromBlockNumber = first block to start looking for the transaction to appear in
        blocksToCheck = the number of blocks to check, after committing the transaction, before giving up
        checkInterval = the time between block checks in MS
        getBlockAttempts = the number of failed attempts at retrieving a particular block, before giving up
  */
  private async awaitTransaction(
    transactionResponse: any,
    waitForConfirm: ConfirmType,
    startFromBlockNumber: number,
    communicationSettings: any,
  ) {
    // use default communicationSettings or whatever was passed-in in ChainSettings (via constructor)
    const useCommunicationSettings = communicationSettings ?? {
      ...EosChainState.defaultCommunicationSettings,
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
      let getBlockAttempt = 1
      // get the chain's current head block number...
      const { transaction_id: transactionId } = transactionResponse || {}
      // starting block number should be the block number in the transaction receipt. If block number not in transaction, use preCommitHeadBlockNum
      let nextBlockNumToCheck = startFromBlockNumber - 1

      let inProgress = false

      // Keep reading blocks from the chain (every checkInterval) until we find the transationId in a block
      // ... or until we reach a max number of blocks or block read attempts
      const timer = setInterval(async () => {
        try {
          if (inProgress) return
          inProgress = true
          const hasReachedConfirmLevel = await this.hasReachedConfirmLevel(
            nextBlockNumToCheck,
            transactionId,
            waitForConfirm,
          )
          if (hasReachedConfirmLevel) {
            this.resolveAwaitTransaction(resolve, timer, transactionResponse)
          }
          nextBlockNumToCheck += 1
          inProgress = false
        } catch (error) {
          const mappedError = mapChainError(error)
          if (mappedError.errorType === 'BlockDoesNotExist') {
            // Try to read the specific block - up to getBlockAttempts times
            if (getBlockAttempt >= maxBlockReadAttempts) {
              this.rejectAwaitTransaction(
                reject,
                timer,
                'maxBlockReadAttemptsTimeout',
                `Await Transaction Failure: Failure to find a block, after ${getBlockAttempt} attempts to check block ${nextBlockNumToCheck}.`,
              )
              return
            }
            getBlockAttempt += 1
          } else {
            // re-throw error - not one we can handle here
            throw mappedError
          }
          inProgress = false
        }

        if (nextBlockNumToCheck > startFromBlockNumber + blocksToCheck) {
          this.rejectAwaitTransaction(
            reject,
            timer,
            'maxBlocksTimeout',
            `Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${(checkInterval / 1000) *
              blocksToCheck} seconds) starting with block num: ${startFromBlockNumber}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`,
          )
        }
      }, checkInterval)
    })
  }

  /** block has reached the confirmation level requested
   *  Currently  only supports checking for first block confirm */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async hasReachedConfirmLevel(blockNum: number, transactionId: number, waitForConfirm: ConfirmType): Promise<boolean> {
    const possibleTransactionBlock = await this.rpc.get_block(blockNum)
    const blockHasTransaction = this.blockHasTransaction(possibleTransactionBlock, transactionId)
    // TODO: Implement support for waitForConfirm types
    // Currently only supports checking for first block confirm
    return !!blockHasTransaction
  }

  resolveAwaitTransaction = (resolve: any, timer: NodeJS.Timeout, transaction: any) => {
    clearInterval(timer)
    resolve(transaction)
  }

  rejectAwaitTransaction = (reject: any, timer: NodeJS.Timeout, errorName: string, errorMessage: string) => {
    clearInterval(timer)
    const error = new Error(errorMessage)
    error.name = errorName
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
