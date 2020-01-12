/** Type of account to craate */
export enum AccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native,
  /** Native account on ORE chain */
  NativeOre,
  /** Native account created by calling an proxy (escrow) contract that actually creates the account */
  CreateEscrow,
  /** Virtual account - if supported by chain */
  VirtualNested,
}

/** Brand signifiying a valid value - assigned by using toChainDate */
export enum ChainDateBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toChainEntity */
export enum ChainEntityNameBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toChainAsset */
export enum ChainAssetBrand {
  _ = '',
}
/** Parameters used to create an account on the chain */
export type CreateAccountOptions = any
/** Date string formatted corectly for the type of chain */
export type ChainDate = string
/** Name string formatted corectly for the type of chain */
export type ChainEntityName = string
/** Token Asset string formatted corectly for the type of chain */
export type ChainAsset = string

/** Supported chain types */
export enum ChainType {
  EosV18 = 'eos',
  EthereumV1 = 'ethereum',
}

/** Monitor services listenting to the chain */
export enum ChainMonitorType {
  NONE,
  DFUSE,
  DEMUX,
}

/** Chain configuation for creating a new connection */
export type ChainSettings = {
  createEscrowContract?: string
  communicationSettings?: {
    blocksToCheck: number
    checkInterval: number
    getBlockAttempts: number
  }
  fetch?: any
  monitorType?: ChainMonitorType
  monitorUrl?: URL
  unusedAccountPublicKey: string
}

/** Chain urls and related details used to connect to chain */
export type ChainEndpoint = {
  url: URL
  chainId?: string
  health?: number /** between 0 and 1 - 0 is not responding, 1 is very fast */
  settings?: ChainSettings
}

/** Chain information including head block number and time and software version */
export type ChainInfo = {
  headBlockNumber: number
  headBlockTime: Date
  version: string
  nativeInfo: any
}
