import Web3 from 'web3'
import { throwNewError, throwAndLogError } from '../../errors'
import { ChainInfo, ChainEndpoint, ChainSettings, ConfirmType } from '../../models'
import { trimTrailingChars } from '../../helpers'
import { mapChainError } from './ethErrors'
import { DEFAULT_BLOCKS_TO_CHECK, DEFAULT_GET_BLOCK_ATTEMPTS, DEFAULT_CHECK_INTERVAL } from './ethConstants'

//   blockIncludesTransaction() {}; // hasTransaction
//   getContractTableRows() {}; // getAllTableRows

export class EthereumChainState {
  private ethChainInfo: any

  private _activeEndpoint: ChainEndpoint

  private _chainInfo: ChainInfo

  private _chainSettings: ChainSettings

  private _endpoints: ChainEndpoint[]

  private _isConnected: boolean = false

  private _web3: any // Ethereum chain api endpoint

  constructor(endpoints: ChainEndpoint[], settings?: ChainSettings) {
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

  /**  * Return instance of Web3 API */
  public get api(): any {
    this.assertIsConnected()
    return this._web3
  }

  /**  * Connect to chain endpoint to verify that it is operational and to get latest block info */
  public async connect(): Promise<void> {
    try {
      if (!this._web3) {
        const url = this.determineUrl()
        this._web3 = new Web3.providers.HttpProvider(url)
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<any> {
    const info = await this._web3.eth.getBlock('latest')
    const { gasLimit, gasUsed, number, timestamp } = info
    const nodeInfo = await this._web3.eth.getNodeInfo()

    // this.ethChainInfo = info;
    this._chainInfo = {
      headBlockNumber: number,
      headBlockTime: new Date(timestamp),
      // Node information contains version example: 'Geth/v1.9.9-omnibus-e320ae4c-20191206/linux-amd64/go1.13.4'
      version: nodeInfo,
      nativeInfo: { gasLimit, gasUsed },
    }
    return info
  }

  // TODO: sort based on health info
  /**  * Choose the best Chain endpoint based on health and response time */
  private determineUrl(): string {
    const url = this.endpoints[0].url.href
    return trimTrailingChars(url, '/')
  }

  /* Retrieve a specific block from the chain */
  public async getBlock(blockNumber: number): Promise<any> {
    this.assertIsConnected()
    const block = await this._web3.get_block(blockNumber)
    return block
  }

  /* Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /*  Retrieve a specific block from the chain */
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
    signatures: string[],
    waitForConfirm?: ConfirmType,
    communicationSettings?: any,
  ) {
    // Default confirm to not wait for any block confirmations
    const useWaitForConfirm = waitForConfirm ?? ConfirmType.None

    if (useWaitForConfirm !== ConfirmType.None && useWaitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }

    const signedTransaction = { signatures, serializedTransaction }
    let transaction

    try {
      transaction = await this._web3.push_transaction(signedTransaction)
    } catch (error) {
      const errString = mapChainError(error)
      throw new Error(`Send Transaction Failure: ${errString}`)
    }

    if (useWaitForConfirm !== ConfirmType.None) {
      transaction = await this.awaitTransaction(transaction, useWaitForConfirm, communicationSettings)
    }

    return transaction
  }

  /** Polls the chain until it finds a block that includes the specific transaction
        Useful when committing sequential transactions with inter-dependencies (must wait for the first one to commit before submitting the next one)
        transactionResponse: The response body from submitting the transaction to the chain (includes transaction Id and most recent chain block number)
        waitForConfirm an enum that specifies how long to wait before 'confirming transaction' and resolving the promise with the tranasction results
        blocksToCheck = the number of blocks to check, after committing the transaction, before giving up
        checkInterval = the time between block checks in MS
        getBlockAttempts = the number of failed attempts at retrieving a particular block, before giving up
  */
  async awaitTransaction(transactionResponse: any, waitForConfirm: ConfirmType, communicationSettings: any) {
    // use default communicationSettings or whatever was passed-in in ChainSettings (via constructor)
    const useCommunicationSettings = communicationSettings ?? {
      ...EthereumChainState.defaultCommunicationSettings,
      ...this.chainSettings?.communicationSettings,
    }
    const { blocksToCheck, checkInterval, getBlockAttempts: maxBlockReadAttempts } = useCommunicationSettings

    if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
      throwNewError(`Specified ConfirmType ${waitForConfirm} not supported`)
    }

    const { head_block_num: preCommitHeadBlockNum } = await this.getChainInfo()

    return new Promise((resolve, reject) => {
      let getBlockAttempt = 1
      // get the chain's current head block number...
      const { processed, transaction_id: transactionId } = transactionResponse || {}
      // starting block number should be the block number in the transaction receipt. If block number not in transaction, use preCommitHeadBlockNum
      const { block_num: blockNum = preCommitHeadBlockNum } = processed || {}
      const startingBlockNumToCheck = blockNum - 1

      let blockNumToCheck = startingBlockNumToCheck
      let inProgress = false

      // Keep reading blocks from the chain (every checkInterval) until we find the transationId in a block
      // ... or until we reach a max number of blocks or block read attempts
      const timer = setInterval(async () => {
        try {
          if (inProgress) return
          inProgress = true
          const hasReachedConfirmLevel = await this.hasReachedConfirmLevel(
            blockNumToCheck,
            transactionId,
            waitForConfirm,
          )
          if (hasReachedConfirmLevel) {
            this.resolveAwaitTransaction(resolve, timer, transactionResponse)
          }
          blockNumToCheck += 1
        } catch (error) {
          const mappedError = mapChainError(error)
          if (mappedError.name === 'BlockDoesNotExist') {
            // Try to read the specific block - up to getBlockAttempts times
            if (getBlockAttempt >= maxBlockReadAttempts) {
              this.rejectAwaitTransaction(
                reject,
                timer,
                'maxBlockReadAttemptsTimeout',
                `Await Transaction Failure: Failure to find a block, after ${getBlockAttempt} attempts to check block ${blockNumToCheck}.`,
              )
              return
            }
            getBlockAttempt += 1
          } else {
            // re-throw error - not one we can handle here
            throw mappedError
          }
        } finally {
          inProgress = false
        }
        if (blockNumToCheck > startingBlockNumToCheck + blocksToCheck) {
          this.rejectAwaitTransaction(
            reject,
            timer,
            'maxBlocksTimeout',
            `Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${(checkInterval / 1000) *
              blocksToCheck} seconds) starting with block num: ${startingBlockNumToCheck}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`,
          )
        }
      }, checkInterval)
    })
  }

  async hasReachedConfirmLevel(
    nextBlockNumToCheck: number,
    transactionId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    waitForConfirm: ConfirmType,
  ): Promise<boolean> {
    const possibleTransactionBlock = await this._web3.get_block(nextBlockNumToCheck)
    const blockHasTransaction = this.blockHasTransaction(possibleTransactionBlock, transactionId)
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
}
