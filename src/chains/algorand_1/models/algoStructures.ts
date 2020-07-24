import { AlgorandAddress } from './cryptoModels'

/** Block producer participation information stored within the account if the account is eligible to produce blocks */
export type AlgorandProducerParticipationStruct = {
  partpkb64: string
  votefst: number
  votekd: number
  votelst: number
  vrfpkb64: string
}

/** Algorand assets held by an Algorand account */
export type AlgorandAssetStruct = {
  creator?: string
  amount: number
  frozen: boolean
}

/** Algorand asset information stored on the chain */
export type AlgorandAssetParamsStruct = {
  assetname: string
  clawbackaddr: AlgorandAddress
  creator: AlgorandAddress
  decimals: number
  defaultfrozen: boolean
  freezeaddr: AlgorandAddress
  managerkey: AlgorandAddress
  metadatahash?: string
  reserveaddr: AlgorandAddress
  total: number
  unitname: string
  url: URL
}

/** Algorand account information stored on the chain */
export type AlgorandAccountStruct = {
  address: AlgorandAddress
  amount?: number
  Amountwithoutpendingrewards?: number
  assets?: Map<string, AlgorandAssetStruct>
  participation?: AlgorandProducerParticipationStruct
  pendingrewards?: number
  rewards?: number
  round?: number
  status?: string
  thisassettotal?: Map<string, AlgorandAssetParamsStruct>
}

/** Latest chain state - from calling {chain}/transactions/params - useful for adding 'header' fields to a transaction */
export type AlgorandChainTransactionParamsStruct = {
  genesishashb64: string
  genesisID: string
  lastRound: number
  consensusVersion: number
  minFee: number
}

/** a signature object for multisig transaction */
export type AlgorandMultiSignatureStruct = { pk: Uint8Array; s?: Uint8Array }

/** Account object generated - in the format returned from algosdk */
export type AlgorandGeneratedAccountStruct = {
  addr: Uint8Array
  sk: Uint8Array
}

/** Algorand's on-chain transaction type codes */
export enum AlgorandTransactionTypeCode {
  AssetConfig = 'acfg',
  AssetFreeze = 'afrz',
  AssetTransfer = 'axfer',
  KeyRegistration = 'keyreg',
  Payment = 'pay',
}

export type AlgorandAddressStruct = {
  publicKey: Uint8Array
  checksum: Uint8Array
}

/** All possible fields in an Algorand transction */
export type AlgorandTxActionStruct = {
  to?: AlgorandAddressStruct
  from?: AlgorandAddressStruct
  amount?: number // integer
  note?: Uint8Array
  name?: string
  tag?: Buffer
  lease?: Uint8Array
  closeRemainderTo?: AlgorandAddressStruct
  voteKey?: string
  selectionKey?: string
  voteFirst?: number // integer
  voteLast?: number // integer
  voteKeyDilution?: number // integer
  assetIndex?: number // integer
  assetTotal?: number // integer
  assetDecimals?: number
  assetDefaultFrozen?: boolean
  assetManager?: AlgorandAddressStruct
  assetReserve?: AlgorandAddressStruct
  assetFreeze?: AlgorandAddressStruct
  assetClawback?: AlgorandAddressStruct
  assetUnitName?: string
  assetName?: string
  assetURL?: string
  assetMetadataHash?: string
  freezeAccount?: AlgorandAddressStruct
  freezeState?: boolean
  assetRevocationTarget?: AlgorandAddressStruct
  type?: AlgorandTransactionTypeCode
  group?: number // integer
  decimals?: number
  genesisID?: string
  genesisHash?: string
  firstRound?: number
  lastRound?: number
  fee?: number
  flatFee?: boolean
}
