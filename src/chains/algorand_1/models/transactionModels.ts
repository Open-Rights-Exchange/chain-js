import { AlgorandValue } from './generalModels'
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
  genesisID: AlgorandValue
  genesisHash: AlgorandValue
  firstRound: number
  lastRound: number
  fee: AlgorandValue
  flatFee: boolean
}

/** Transaction 'header' options set to chain along with the content type */
export type AlgorandTransactionOptions = {
  fee?: AlgorandValue
  flatFee?: boolean
}

/** Raw transaction ready to be signed */
export type AlgorandRawTransaction = {
  from: AlgorandAddress
  to: AlgorandAddress
  amount: AlgorandValue
  note: AlgorandValue
  genesisID: AlgorandValue
  genesisHash: AlgorandValue
  firstRound: number
  lastRound: number
  fee: AlgorandValue
  flatFee: boolean
}

/** Properties of an Algorand transaction action
 *  Can be used to create or compose a new Algorand action
 *  from - must be present
 */
export type AlgorandTransactionAction = {
  to?: AlgorandAddress
  from: AlgorandAddress
  amount?: AlgorandValue
  note?: AlgorandValue
}
