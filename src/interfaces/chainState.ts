import {
  ChainEndpoint,
  ChainEntityName,
  ChainInfo,
  ChainSettings,
  ChainSettingsCommunicationSettings,
  ChainSymbol,
  ConfirmType,
} from '../models'

/** The ChainState interface declares the operations that all concrete chainState classes must implement */
export interface ChainState {
  // 'constructor'(endpoints: ChainEndpoint[], settings?: ChainSettings): void

  /** Return chain URL endpoints */
  activeEndpoint: ChainEndpoint

  /** Return chain ID */
  chainId: string

  /** Return chain info - e.g. head block number */
  chainInfo: ChainInfo

  /** Return chain settings */
  chainSettings: ChainSettings

  /** Return chain URL endpoints */
  endpoints: ChainEndpoint[]

  /** Whether any information has been retrieved from the chain yet
   *   A value here confirms that the network is working
   * */
  isConnected: boolean

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */
  connect(): Promise<void>

  /** Retrieve lastest chain info including head block number and time */
  getChainInfo(): Promise<any>

  /** Retrieve a specific block from the chain */
  getBlock(blockNumber: number): Promise<any>

  /** Fetches data from a contract table */
  fetchContractData(
    contract: ChainEntityName,
    table: string,
    owner: ChainEntityName,
    indexNumber: number,
    lowerRow: number,
    upperRow: number,
    limit: number,
    reverseOrder: boolean,
    showPayer: boolean,
    keyType: string,
  ): Promise<any>

  /** Fetches data from a contract table */
  fetchContractTable(params: any): Promise<any>

  /** Get the token balance for an account from the chain */
  fetchBalance(
    account: ChainEntityName,
    symbol: ChainSymbol,
    tokenAddress: ChainEntityName,
  ): Promise<{ balance: string }>

  /** Confirm that we've connected to the chain - throw if not */
  assertIsConnected(): void

  /** Return a transaction if its included in a block */
  findBlockInTransaction(block: any, transactionId: string): any

  /** Broadcast a signed transaction to the chain */
  sendTransaction(
    signedTransaction: any,
    waitForConfirm: ConfirmType,
    communicationSettings?: ChainSettingsCommunicationSettings,
  ): Promise<any>
}
