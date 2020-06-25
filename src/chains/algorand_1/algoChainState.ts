import algosdk from 'algosdk'
import { throwAndLogError, throwNewError } from '../../errors'
import { ChainEndpoint, ChainInfo, ConfirmType } from '../../models'
import {
  AlgoClient,
  AlgorandChainEndpoint,
  AlgorandChainSettings,
  AlgorandChainSettingsCommunicationSettings,
  AlgorandHeader,
  AlgorandUnit,
  AlgorandSymbol,
} from './models/generalModels'
import { AlgorandTxResult } from './models/transactionModels'
import { isNullOrEmpty, trimTrailingChars, getHeaderValueFromEndpoint } from '../../helpers'
import { ALGORAND_POST_CONTENT_TYPE, NATIVE_CHAIN_SYMBOL } from './algoConstants'
import { AlgorandAddress } from './models/cryptoModels'
import { toAlgo } from './helpers/generalHelpers'

export class AlgorandChainState {
  private _activeEndpoint: ChainEndpoint

  private _chainInfo: ChainInfo

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
    if ((symbol || '').toLowerCase() === NATIVE_CHAIN_SYMBOL.toLowerCase()) {
      return { balance: await this.getAlgorandBalance(account) }
    }

    const balance = await this.getAssetBalance(account, symbol)
    return { balance: balance || '0' }
  }

  /** Utilizes native algosdk method to get Algo token balance for an account (in microalgos) */
  public async getAlgorandBalance(address: AlgorandAddress): Promise<string> {
    const accountInfo = await this._algoClient.accountInformation(address)
    const { amount } = accountInfo
    return toAlgo(amount, AlgorandUnit.Microalgo).toString()
  }

  /** Utilizes native algosdk method to get Algo token balance for an account (in microalgos) */
  public async getAssetBalance(address: AlgorandAddress, assetSymbol: string): Promise<string> {
    const accountInfo = await this._algoClient.accountInformation(address)
    const { assets } = accountInfo || {}
    const assetInfo = assets[assetSymbol] || {}
    const { amount = null } = assetInfo || {}
    return amount
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
  async sendTransactionWithoutWaitingForConfirm(signedTransaction: Uint8Array) {
    try {
      const { txId: transactionId } = await this._algoClientWithTxHeader.sendRawTransaction(signedTransaction)
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
    signedTransaction: Uint8Array,
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
        const transactionId = await this._algoClientWithTxHeader.sendRawTransaction(signedTransaction)
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
