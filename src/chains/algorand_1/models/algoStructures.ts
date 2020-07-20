import { ChainActionType } from '../../../models'
import { AlgorandAddress } from './cryptoModels'
import { AlgorandChainActionType } from './chainActionTypeModels'

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

/** a signature object for multisig transaction */
export type AlgorandMultiSignatureStruct = { pk: Uint8Array; s?: Uint8Array }

/** Account object generated - in the format returned from algosdk */
export type AlgorandGeneratedAccountStruct = {
  addr: Uint8Array
  sk: Uint8Array
}

export type AlgorandDecomposeReturn = {
  chainActionType: ChainActionType | AlgorandChainActionType
  args: any
  partial?: boolean
}
