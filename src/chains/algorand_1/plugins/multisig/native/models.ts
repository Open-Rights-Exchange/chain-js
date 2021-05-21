import { AlgorandRawTransactionMultisigStruct } from '../../../models/algoStructures'

export type AlgorandMultisigNativeOptions = {
  version: number
  threshold: number
  addrs: string[]
}

export type AlgorandMultisigNativePluginOptions = {
  multisigOptions?: AlgorandMultisigNativeOptions
  rawTransaction?: AlgorandRawTransactionMultisigStruct
}
