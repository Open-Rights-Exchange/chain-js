import Web3 from 'web3'
import { BlockTransactionString } from 'web3-eth'
import { throwNewError, throwAndLogError } from '../../errors'
import { ChainInfo, ChainEndpoint, ChainSettings, ConfirmType, TransactionReceipt } from '../../models'
import { trimTrailingChars } from '../../helpers'
import { mapChainError } from './ethErrors'
import { DEFAULT_BLOCKS_TO_CHECK, DEFAULT_GET_BLOCK_ATTEMPTS, DEFAULT_CHECK_INTERVAL } from './ethConstants'

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
    return this._chainInfo
  }

  // TODO: sort based on health info
  /**  * Choose the best Chain endpoint based on health and response time */
  private determineUrl(): string {
    const url = this.endpoints[0].url.href
    return trimTrailingChars(url, '/')
  }

  /* Retrieve a specific block from the chain */
  public async getBlock(blockNumber: number | string): Promise<BlockTransactionString> {
    this.assertIsConnected()
    const block = await this._web3.eth.getBlock(blockNumber)
    return block
  }

  /* Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /*  Retrieve a specific block from the chain */
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

  /** Submits the transaction to the chain and waits only till it gets a transaction hash
   * Does not wait for the transaction to be finalized on the chain
   */
  sendTransactionWithoutWaitingForConfirm(signedTransaction: string) {
    return new Promise((resolve, reject) => {
      this._web3.eth
        .sendSignedTransaction(signedTransaction)
        .once('transactionHash', hash => {
          resolve(hash)
        })
        .on('error', err => {
          reject(err)
        })
    })
  }

  /** Broadcast a signed transaction to the chain
  /* if ConfirmType.None, returns the transaction hash without waiting for further tx receipt
  /* if ConfirmType.After001, waits for the transaction to finalize on chain and then returns the tx receipt
  */
  async sendTransaction(signedTransaction: string, waitForConfirm?: ConfirmType) {
    // Default confirm to not wait for any block confirmations
    const useWaitForConfirm = waitForConfirm ?? ConfirmType.None
    const sendReceipt: TransactionReceipt = {}
    if (useWaitForConfirm !== ConfirmType.None && useWaitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }

    try {
      // returns transactionHash after submitting transaction does NOT wait for confirmation from chain
      if (useWaitForConfirm === ConfirmType.None) {
        sendReceipt.transactionHash = await this.sendTransactionWithoutWaitingForConfirm(signedTransaction)
      }
      // returns transactionReceipt after submitting transaction AND waiting for a confirmation
      if (useWaitForConfirm === ConfirmType.After001) {
        sendReceipt.transactionReceipt = await this._web3.eth.sendSignedTransaction(signedTransaction)
      }
    } catch (error) {
      const chainError = mapChainError(error)
      throw chainError
    }

    return sendReceipt
  }

  /** Return instance of Web3js API */
  public get web3(): Web3 {
    this.assertIsConnected()
    return this._web3
  }
}
