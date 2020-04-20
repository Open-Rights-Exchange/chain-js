import Web3 from 'web3'
import { BlockTransactionString } from 'web3-eth'
import { throwNewError, throwAndLogError } from '../../errors'
import { ChainInfo, ChainEndpoint, ChainSettings, ConfirmType, TransactionReceipt } from '../../models'
import { trimTrailingChars } from '../../helpers'
import { mapChainError } from './ethErrors'
import { DEFAULT_BLOCKS_TO_CHECK, DEFAULT_GET_BLOCK_ATTEMPTS, DEFAULT_CHECK_INTERVAL } from './ethConstants'
import { ChainFunctionCategory, EthereumAddress, EthereumBlockNumber } from './models'

//   blockIncludesTransaction() {}; // hasTransaction
//   getContractTableRows() {}; // getAllTableRows

export class EthereumChainState {
  private ethChainInfo: BlockTransactionString

  private _activeEndpoint: ChainEndpoint

  private _chainInfo: ChainInfo

  private _chainSettings: ChainSettings

  private _endpoints: ChainEndpoint[]

  private _isConnected: boolean = false

  private _web3: Web3 // Ethereum chain api endpoint

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

  /**  * Connect to chain endpoint to verify that it is operational and to get latest block info */
  public async connect(): Promise<void> {
    try {
      if (!this._web3) {
        const url = this.determineUrl()
        this._web3 = new Web3(url)
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<ChainInfo> {
    // Not calling this.getBlock() because this.connect() calls this function before it sets this._isConnected = true
    const info = await this._web3.eth.getBlock('latest')
    const { gasLimit, gasUsed, number, timestamp } = info
    try {
      const nodeInfo = await this._web3.eth.getNodeInfo()
      this._chainInfo = {
        headBlockNumber: number,
        headBlockTime: new Date(timestamp),
        // Node information contains version example: 'Geth/v1.9.9-omnibus-e320ae4c-20191206/linux-amd64/go1.13.4'
        version: nodeInfo,
        nativeInfo: { gasLimit, gasUsed },
      }
      return this._chainInfo
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.ChainState)
      throw chainError
    }
  }

  // TODO: sort based on health info
  /**  * Choose the best Chain endpoint based on health and response time */
  private determineUrl(): string {
    const url = this.endpoints[0].url.href
    return trimTrailingChars(url, '/')
  }

  /** Retrieve a specific block from the chain */
  public async getBlock(blockNumber: number | string): Promise<BlockTransactionString> {
    try {
      this.assertIsConnected()
      const block = await this._web3.eth.getBlock(blockNumber)
      return block
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Block)
      throw chainError
    }
  }

  /** Retrieve a specific block from the chain */
  public async getGasPrice(): Promise<number> {
    try {
      this.assertIsConnected()
      const gasPrice = parseInt(await this._web3.eth.getGasPrice(), 10)
      return gasPrice
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.ChainState)
      throw chainError
    }
  }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Get transaction count that belongs to the address
   *  Useful to calculate transaction nonce propery */
  public async getTransactionCount(
    address: EthereumAddress & string,
    defaultBlock: EthereumBlockNumber,
  ): Promise<number> {
    try {
      return this._web3.eth.getTransactionCount(address, defaultBlock)
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
      throw chainError
    }
  }

  /** Retrieve a specific block from the chain */
  public blockHasTransaction = (block: BlockTransactionString, transactionId: string): boolean => {
    const { transactions } = block
    const result = transactions?.includes(transactionId)
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

  /**  Submits the transaction to the chain and waits only till it gets a transaction hash.
   * Does not wait for the transaction to be finalized on the chain.
   */
  sendTransactionWithoutWaitingForConfirm(signedTransaction: string) {
    return new Promise((resolve, reject) => {
      this._web3.eth.sendSignedTransaction(signedTransaction).once('transactionHash', hash => {
        resolve(hash)
      })
    })
  }

  /** Broadcast a signed transaction to the chain */
  /* Confirm type None returns the transaction hash
  /* Confirm type 001 waits for the transaction to finalise on chain and then returns the transaction receipt
  */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendTransaction(signedTransaction: string, waitForConfirm?: ConfirmType, communicationSettings?: any) {
    // Default confirm to not wait for any block confirmations
    const useWaitForConfirm = waitForConfirm ?? ConfirmType.None
    const sendReceipt: TransactionReceipt = {}
    if (useWaitForConfirm !== ConfirmType.None && useWaitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }

    try {
      if (useWaitForConfirm === ConfirmType.None) {
        sendReceipt.transactionHash = await this.sendTransactionWithoutWaitingForConfirm(signedTransaction)
      }

      if (useWaitForConfirm === ConfirmType.After001) {
        sendReceipt.transactionReceipt = await this._web3.eth.sendSignedTransaction(signedTransaction)
      }
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
      throw chainError
    }

    return sendReceipt
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

    const { headBlockNumber: preCommitHeadBlockNum } = await this.getChainInfo()

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
    transactionId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    waitForConfirm: ConfirmType,
  ): Promise<boolean> {
    const possibleTransactionBlock = await this.getBlock(nextBlockNumToCheck)
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

  /** Return instance of Web3js API */
  public get web3(): Web3 {
    this.assertIsConnected()
    return this._web3
  }
}
