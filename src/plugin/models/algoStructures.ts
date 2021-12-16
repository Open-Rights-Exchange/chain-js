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
  amount: number
  'asset-id': number
  creator?: string
  deleted?: boolean
  'is-frozen': boolean
  'opted-in-at-round': number
}

/** Algorand asset information stored on the chain */
export type AlgorandAssetParamsStruct = {
  assetname: string
  clawbackaddr: AlgorandAddress
  creator: AlgorandAddress
  assetDecimals: number
  assetDefaultFrozen: boolean
  assetFreeze: AlgorandAddress
  assetManager: AlgorandAddress
  assetMetadataHash?: string
  assetReserve: AlgorandAddress
  total: number
  unitname: string
  url: URL
}

/** Algorand account information stored on the chain */
export type AlgorandAccountStruct = {
  address: AlgorandAddress
  amount?: number
  'amount-without-pending-rewards'?: number
  'apps-local-state'?: any // Todo: Type this
  'apps-total-schema'?: any // Todo: Type this
  assets?: AlgorandAssetStruct[]
  'created-apps'?: any // Todo: Type this
  'created-assets'?: any // Todo: Type this
  'created-at-round'?: number
  deleted?: boolean
  'pending-rewards'?: number
  'reward-base'?: number
  rewards?: number
  round?: number
  'sig-type'?: string
  status?: string
}

/** Latest chain state - from calling {chain}/transactions/params - useful for adding 'header' fields to a transaction */
export type AlgorandChainTransactionParamsStruct = {
  genesisHash: string
  genesisID: string
  firstRound: number
  lastRound: number
  minFee: number
  suggestedFee: number
}

/** Account object generated - in the format returned from algosdk */
export type AlgorandGeneratedAccountStruct = {
  addr: string
  sk: Uint8Array
}

/** Algorand's on-chain transaction type codes */
export enum AlgorandTransactionTypeCode {
  Application = 'appl',
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
  voteKey?: Buffer
  selectionKey?: Buffer
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
  assetMetadataHash?: string | Uint8Array
  freezeAccount?: AlgorandAddressStruct
  freezeState?: boolean
  assetRevocationTarget?: AlgorandAddressStruct
  type?: string
  group?: Buffer
  appIndex?: number
  appOnComplete?: number
  appLocalInts?: number
  appLocalByteSlices?: number
  appGlobalInts?: number
  appGlobalByteSlices?: number
  appApprovalProgram?: Uint8Array
  appClearProgram?: Uint8Array
  appArgs?: Uint8Array[]
  appAccounts?: AlgorandAddressStruct[]
  appForeignApps?: number[]
  appForeignAssets?: number[]
  reKeyTo?: AlgorandAddressStruct
  genesisID?: string
  genesisHash?: Buffer
  firstRound?: number
  lastRound?: number
  fee?: number
  flatFee?: boolean // flatfee is not included in the actual transaction data sent to chain - its only a hint to the algoSdk.transaction object
  nonParticipation?: boolean
  extraPages?: number
}

/** Algorand transaction encoded and 'minified' ready to send to chain */
export type AlgorandTxEncodedForChain = {
  rcv?: Buffer // Buffer.from(to.publicKey)
  name?: string
  tag?: Buffer // Buffer.from(...)
  amt?: number | bigint // integer
  note?: Buffer // Buffer.from(note)
  snd?: Buffer // Buffer.from(from.publicKey)
  type?: AlgorandTransactionTypeCode | string // type
  fv?: number // firstRound
  lv?: number // lastRound
  fee?: number // fee
  gen?: string // genesisID
  gh?: Buffer // genesisHash - Buffer.from(genesisHash, 'base64')
  lx?: Buffer // Buffer.from(lease),
  grp?: Buffer // group
  voteKey?: Buffer // voteKey
  selkey?: Buffer // selectionKey
  votefst?: number // voteFirst
  votelst?: number // voteLast
  votekd?: number // voteKeyDilution
  caid?: number // assetIndex
  apar?: {
    t?: number | bigint // assetTotal
    df?: boolean // assetDefaultFrozen
    dc?: number // assetDecimals
    m?: Buffer // Buffer.from(assetManager.publicKey)
    r?: Buffer // Buffer.from(assetReserve.publicKey)
    f?: Buffer // Buffer.from(assetFreeze.publicKey)
    c?: Buffer // Buffer.from(assetClawback.publicKey)
    an?: string // assetName
    un?: string // assetUnitName
    au?: string // assetURL
    am?: Buffer // Buffer.from(assetMetadataHash)
  }
  apid?: number // appIndex,
  apan?: number // appOnComplete
  apls?: {
    nui?: number // appLocalInts
    nbs?: number // appLocalByteSlices
  }
  apgs?: {
    nui?: number // appGlobalInts,
    nbs?: number // appGlobalByteSlices
  }
  apfa?: number[] // appForeignApps,
  apas?: number[] // appForeignAssets,
  apap?: Buffer // Buffer.from(appApprovalProgram)
  apsu?: Buffer // Buffer.from(appClearProgram)
  apaa?: Buffer[] // appArgs.forEach((arg) => { txn.apaa.push(Buffer.from(arg))
  apat?: Buffer[] // appAccounts.forEach((decodedAddress) => { txn.apat.push(Buffer.from(decodedAddress.publicKey))
  aclose?: Buffer // Buffer.from(closeRemainderTo.publicKey)
  asnd?: Buffer // Buffer.from(assetRevocationTarget.publicKey)
  fadd?: Buffer // Buffer.from(freezeAccount.publicKey)
  afrz?: boolean // freezeState
  reKeyTo?: Buffer // Buffer.from(reKeyTo.publicKey)
  apep?: number // appIndex,
  // todo: is a field for nonParticipation missing here?
}

/** a signature object for multisig transaction */
export type AlgorandMultiSignatureStruct = {
  /** Public key - Buffer encoded string */
  pk: Uint8Array
  /** Signature - Buffer encoded Uint8Array */
  s?: Uint8Array
}

export type AlgorandMultiSignatureMsigStruct = {
  /** multisig version */
  v: number
  /** multisig threshold */
  thr: number
  subsig: AlgorandMultiSignatureStruct[]
}

/** the object that can be encoded as a Uint8Array and sent to the chain */
export type AlgorandRawTransactionMultisigStruct = {
  /** JSON object */
  txn: AlgorandTxEncodedForChain
  msig: AlgorandMultiSignatureMsigStruct
}

/** the object that can be encoded as a Uint8Array and sent to the chain */
export type AlgorandRawTransactionStruct = {
  /** JSON object */
  txn: AlgorandTxEncodedForChain
  /** Signature - Buffer encoded Uint8Array */
  sig: Buffer
  /** Public key - Buffer encoded string - for signing key (only populated if different then the from address) */
  sgnr?: Buffer
}

/** Results from calling an Algo SDK sign function */
export type AlgorandTxSignResults = {
  txID: string
  blob: Uint8Array
}

export type AlgorandBlock = {
  rewards: any
  round: number
  seed: string
  timestamp: number
  transactions: any[]
}
