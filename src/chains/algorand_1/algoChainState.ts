import algosdk from 'algosdk'
import { throwAndLogError, throwNewError } from '../../errors'
import { ChainEndpoint, ChainInfo, ConfirmType } from '../../models'
import {
  AlgorandChainSettingsCommunicationSettings,
  AlgorandChainSettings,
  AlgorandConnectionSettings,
  AlgoClient,
} from './models/generalModels'
import { AlgorandTxResult } from './models/transactionModels'

export class AlgorandChainState {
  private _activeEndpoint: ChainEndpoint

  private _chainInfo: ChainInfo

  private _chainSettings: AlgorandChainSettings

  private _endpoints: ChainEndpoint[]

  private _isConnected: boolean = false

  private _algoClient: AlgoClient

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
    return this._chainInfo?.nativeInfo?.chain_id
  }

  /** Return chain info - e.g. head block number */
  public get chainInfo(): ChainInfo {
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
        const { token, server, port } = this.getAlgorandConnectionSettings()
        this._algoClient = new algosdk.Algod(token, server, port)
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<ChainInfo> {
    try {
      const nodeInfo = await this._algoClient.status()
      const { lastRound, lastConsensusVersion } = nodeInfo
      const { timestamp } = await this._algoClient.block(lastRound)
      this._chainInfo = {
        headBlockNumber: lastRound,
        headBlockTime: new Date(timestamp),
        // version example: 'https://github.com/algorandfoundation/specs/tree/e5f565421d720c6f75cdd186f7098495caf9101f'
        version: lastConsensusVersion,
        nativeInfo: nodeInfo,
      }
      return this._chainInfo
    } catch (error) {
      // ALGO TODO: map chain error
      throw new Error()
    }
  }

  // TODO: sort based on health info
  /**  * Choose the best Chain endpoint based on health and response time */
  private getAlgorandConnectionSettings(): AlgorandConnectionSettings {
    const { url, settings } = this.endpoints[0]
    const { token, port = '' } = settings
    return { server: url, token, port }
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
    try {
      const { txId: transactionId } = await this._algoClient.sendRawTransaction(signedTransaction)
      return transactionId
    } catch (error) {
      // ALGO TODO: map chain error
      throw new Error()
    }
  }

  /**
   * Confirms a transaction on chain by repeatedly checking if the given transaction id is in the pending transactions on the chain
   * Transactions are generally confirmed in less than 5 seconds on Algorand
   */
  async waitForTransactionConfirmation(transactionId: string) {
    let waitingConfirmation = true

    while (waitingConfirmation) {
      // eslint-disable-next-line no-await-in-loop
      const pendingTransaction = await this._algoClient.pendingTransactionInformation(transactionId)
      if (pendingTransaction.round != null && pendingTransaction.round > 0) {
        // Got the completed Transaction
        waitingConfirmation = false
      }
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
    const sendResult: Partial<AlgorandTxResult> = {}

    if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }

    try {
      // returns transactionHash after submitting transaction does NOT wait for confirmation from chain
      if (waitForConfirm === ConfirmType.None) {
        const transactionId = (await this.sendTransactionWithoutWaitingForConfirm(signedTransaction)) as string
        sendResult.chainResponse = null
        sendResult.transactionId = transactionId
      }
      // returns transactionReceipt after submitting transaction AND waiting for a confirmation
      if (waitForConfirm === ConfirmType.After001) {
        const transactionId = await this._algoClient.sendRawTransaction(signedTransaction)
        await this.waitForTransactionConfirmation(transactionId)
        sendResult.transactionId = transactionId
        sendResult.chainResponse = await this._algoClient.transactionById(transactionId)
      }
    } catch (error) {
      // ALGO TODO: map chain error
      throw new Error()
    }

    return sendResult as AlgorandTxResult
  }

  /** Return instance of algo API */
  public get algo(): AlgoClient {
    this.assertIsConnected()
    return this._algoClient
  }
}
