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
