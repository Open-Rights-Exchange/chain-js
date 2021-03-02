import { AlgorandValue, AlgorandMultiSigOptions } from './generalModels'
import { AlgorandAddress, AlgorandPublicKey } from './cryptoModels'
import { AlgorandTxActionStruct } from './algoStructures'

/**
 * Chain response type after a transaction is confirmed on the chain
 */
export type AlgorandTxChainResponse = {
  type: string
  tx: string
  from: string
  fee: number
  'first-round': number
  'last-round': number
  noteb64: string
  round: number
  payment?: {
    to: string
    amount: number
    torewards: number
    closerewards: number
  }
  fromrewards?: number
  genesisID: string
  genesishashb64: string
  note: Buffer
}

/**
 * Chain response type after submitting a transaction
 */
export type AlgorandTxResult = {
  transactionId: string
  chainResponse?: AlgorandTxChainResponse
}

/** Transaction properties that contain the genesis information and fee required to construct a transaction */
export type AlgorandTxHeaderParams = {
  genesisID?: string // like genesisHash this is used to specify network to be used
  genesisHash?: string // hash of the genesis block of the network to be used
  firstRound?: number // first Algorand round on which this transaction is valid
  lastRound?: number // last Algorand round on which this transaction is valid
  fee?: number // the number of microAlgos per byte to pay as a transaction fee
  flatFee?: boolean // Use a flat fee instead of the fees suggested by the chain
}

/** A type passed to algorand SDK that includes transaction params common to use with make...TxnWithSuggestedParams functions */
export type AlgorandSuggestedParams = {
  genesisID: string
  genesisHash: string
  firstRound: number
  lastRound: number
  fee: number
  flatFee?: boolean
}

/** Transaction 'header' options set to chain along with the content type */
export type AlgorandTransactionOptions = {
  /** Number of seconds after which transaction expires - must be submitted to the chain before then */
  expireSeconds?: number
  fee?: AlgorandValue
  flatFee?: boolean
  multiSigOptions?: AlgorandMultiSigOptions
  /** (optional) The publicKey used to sign the transaction - if an account has been rekeyed, use the signing key here
   * if not provided, defaults to 'from' address's publicKey */
  signerPublicKey?: AlgorandPublicKey
}

/** Raw transaction ready to be signed */
export type AlgorandTxActionRaw = AlgorandTxActionStruct

/** All possible properties of an Algorand transaction action
 *  Can be used to create or compose a new Algorand action */
export type AlgorandTxAction = AlgorandTxActionUnencodeFields & AlgorandTxActionSharedFields

/** All possible properties of an Algorand transaction action
 *  Encodes several fields (e.g. note) as expected by the algoSDK */
export type AlgorandTxActionSdkEncoded = AlgorandTxActionSdkEncodedFields & AlgorandTxActionSharedFields

/** action fields in an unencoded state (these will be encoded for the algorand SDK) */
export type AlgorandTxActionUnencodeFields = {
  appApprovalProgram?: string // hexstring encoded compiled TEAL code
  appClearProgram?: string // hexstring encoded compiled TEAL code
  appArgs?: (string | number | Uint8Array)[] // can be string, base64 string, hex string ('0x' prefix), number, or UInt8Array
  group?: string
  lease?: string
  note?: string
  selectionKey?: string
  tag?: string
  voteKey?: string
}

/** action fields as they should be encoded for the algorand SDK */
export type AlgorandTxActionSdkEncodedFields = {
  appApprovalProgram?: Uint8Array
  appClearProgram?: Uint8Array
  appArgs?: Uint8Array[]
  group?: Buffer
  lease?: Uint8Array
  note?: Uint8Array
  selectionKey?: Buffer
  tag?: Buffer
  voteKey?: Buffer
}

/** Algorand Tx Fields for both SdkEncoded and non-encoded types
 *  All possible properties of an Algorand transaction action
 *  Can be used to create or compose a new Algorand action
 */
type AlgorandTxActionSharedFields = AlgorandTxHeaderParams & {
  to?: AlgorandAddress
  from?: AlgorandAddress
  amount?: number // integer
  name?: string
  lease?: string
  closeRemainderTo?: AlgorandAddress
  voteKey?: string
  selectionKey?: string
  voteFirst?: number // integer
  voteLast?: number // integer
  voteKeyDilution?: number // integer
  assetIndex?: number // integer
  assetTotal?: number // integer
  assetDecimals?: number // integer
  assetDefaultFrozen?: boolean
  assetManager?: AlgorandAddress
  assetReserve?: AlgorandAddress
  assetFreeze?: AlgorandAddress
  assetClawback?: AlgorandAddress
  assetUnitName?: string
  assetName?: string
  assetURL?: string
  assetMetadataHash?: string
  freezeAccount?: AlgorandAddress
  freezeState?: boolean
  assetRevocationTarget?: AlgorandAddress
  type?: string
  group?: string
  decimals?: number
  appIndex?: number
  appOnComplete?: number
  appLocalInts?: number
  appLocalByteSlices?: number
  appGlobalInts?: number
  appGlobalByteSlices?: number
  appAccounts?: AlgorandAddress[]
  appForeignApps?: number[]
  appForeignAssets?: number[]
  reKeyTo?: AlgorandAddress
}

/** Algorand spesific transaction execution resource unit
 * Used for calculation transaction cost
 */
export type AlgorandTransactionResources = {
  bytes: number
}
