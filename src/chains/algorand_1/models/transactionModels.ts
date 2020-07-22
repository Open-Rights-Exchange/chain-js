import { AlgorandValue, AlgorandMultiSigOptions } from './generalModels'
import { AlgorandAddress } from './cryptoModels'

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
  chainResponse: AlgorandTxChainResponse
}

/** Transaction properties that contain the genesis information and fee required to construct a transaction */
export type AlgorandTransactionHeader = {
  genesisID?: AlgorandValue // like genesisHash this is used to specify network to be used
  genesisHash?: AlgorandValue // hash of the genesis block of the network to be used
  firstRound?: number // first Algorand round on which this transaction is valid
  lastRound?: number // last Algorand round on which this transaction is valid
  fee?: AlgorandValue // the number of microAlgos per byte to pay as a transaction fee
  flatFee?: boolean // Use a flat fee instead of the fees suggested by the chain
  closeRemainderTo?: AlgorandValue // Make an account inactive by transferring all the remaining fund to this account
}

/** Transaction 'header' options set to chain along with the content type */
export type AlgorandTransactionOptions = {
  fee?: AlgorandValue
  flatFee?: boolean
  multiSigOptions?: AlgorandMultiSigOptions
}

/** Raw transaction ready to be signed */
export type AlgorandRawTransaction = AlgorandTransactionAction

/** Properties of an Algorand transaction action
 *  Can be used to create or compose a new Algorand action
 *  from - must be present
 */
export type AlgorandTransactionAction = {
  to?: AlgorandAddress
  from: AlgorandAddress
  amount?: AlgorandValue
  note?: AlgorandValue
  name?: string
  tag?: Buffer
  lease?: Uint8Array[]
  closeRemainderTo?: AlgorandValue
  voteKey?: AlgorandValue
  selectionKey?: AlgorandValue
  voteFirst?: AlgorandValue
  voteLast?: AlgorandValue
  voteKeyDilution?: AlgorandValue
  assetIndex?: AlgorandValue
  assetTotal?: AlgorandValue
  assetDecimals?: AlgorandValue
  assetDefaultFrozen?: AlgorandValue
  assetManager?: AlgorandValue
  assetReserve?: AlgorandValue
  assetFreeze?: AlgorandValue
  assetClawback?: AlgorandValue
  assetUnitName?: AlgorandValue
  assetName?: AlgorandValue
  assetURL?: AlgorandValue
  assetMetadataHash?: AlgorandValue
  freezeAccount?: AlgorandValue
  freezeState?: AlgorandValue
  assetRevocationTarget?: AlgorandValue
  type?: AlgorandValue
  group?: AlgorandValue
} & AlgorandTransactionHeader
