/** Supported chain types */
export enum ChainType {
  EosV18 = 'eos v1.8',
  EthereumV1 = 'ethereum v1.0',
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
