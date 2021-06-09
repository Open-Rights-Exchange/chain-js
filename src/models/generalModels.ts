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

/** Brand signifiying a valid value - assigned by using toSymbol */
export enum ChainSymbolBrand {
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
/** Token or value symbol */
export type ChainSymbol = string & ChainSymbolBrand
/** Parameters related to chain api requests */
export type ChainSettingsCommunicationSettings = {
  blocksToCheck: number
  checkInterval: number
  getBlockAttempts: number
}

/** Supported chain types */
export enum ChainType {
  EosV2 = 'eos',
  EthereumV1 = 'ethereum',
  AlgorandV1 = 'algorand',
}

/** Chain urls and related details used to connect to chain */
export type ChainEndpoint = {
  /** api endpoint url - including http(s):// prefix */
  url: string
  /** Options are name/value pairs set to chain endpoint - they are chain-specific
   *  Often includes array of headers to be included in HTTP requests to chain endpoint
   *  e.g. options.headers = [{"Authorization":"Bearer..."}] */
  options?: { [key: string]: any }
  /** between 0 and 1 - 0 is not responding, 1 is very fast */
  health?: number
}

/** Chain information including head block number and time and software version */
export type ChainInfo = {
  headBlockNumber: number
  headBlockTime: Date
  version: string
  nativeInfo: any
}

/** Chain-specific options */
export type ChainSettings = any

/** Generic type for accessing an object by a key e.g. myObject[myKey] = ... */
export type IndexedObject = { [key: string]: any }
