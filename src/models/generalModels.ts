/** Type of account to craate */
export enum NewAccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native = 'Native',
  /** Native account created by calling a proxy (escrow) contract that actually creates the account */
  CreateEscrow = 'CreateEscrow',
}

/** Brand signifiying a valid value - assigned by using toDate */
export enum ChainDateBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toEntity */
export enum ChainEntityNameBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toAsset */
export enum ChainAssetBrand {
  _ = '',
}
/** Parameters used to create an account on the chain */
export type CreateAccountOptions = any
/** Date string formatted correctly for the type of chain */
export type ChainDate = string & ChainDateBrand
/** Name string formatted correctly for the type of chain */
export type ChainEntityName = string & ChainEntityNameBrand
/** Token Asset string formatted correctly for the type of chain */
export type ChainAsset = string & ChainAssetBrand

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
  unusedAccountPublicKey?: string
  chainForkType?: ChainForkType
}

export type ChainForkType = {
  chainName: string
  hardFork: string
}

/** Chain urls and related details used to connect to chain */
export type ChainEndpoint = {
  url: URL
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

export enum ChainActionType {
  AccountCreate = 'AccountCreate',
  AccountDeleteAuth = 'AccountDeleteAuth',
  AccountLinkAuth = 'AccountLinkAuth',
  AccountUnlinkAuth = 'AccountUnlinkAuth',
  AccountUpdateAuth = 'AccountUpdateAuth',
  CreateEscrowCreate = 'CreateEscrowCreate',
  CreateEscrowDefine = 'CreateEscrowDefine',
  CreateEscrowInit = 'CreateEscrowInit',
  CreateEscrowReclaim = 'CreateEscrowReclaim',
  CreateEscrowTransfer = 'CreateEscrowTransfer',
  CreateEscrowWhitelist = 'CreateEscrowWhitelist',
  OreCreateAccount = 'OreCreateAccount',
  OreUpsertRight = 'OreUpsertRight',
  TokenApprove = 'TokenApprove',
  TokenCreate = 'TokenCreate',
  TokenIssue = 'TokenIssue',
  TokenRetire = 'TokenRetire',
  TokenTransfer = 'TokenTransfer',
  TokenTransferFrom = 'TokenTransferFrom',
}
