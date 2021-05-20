import { AlgorandRawTransactionMultisigStruct } from '../../../models/algoStructures'

export type AlgorandMultisigNativeOptions = {
  version: number
  threshold: number
  addrs: string[]
}

export type AlgorandMultisigNativePluginInput = {
  multisigOptions?: AlgorandMultisigNativeOptions
  rawTransaction?: AlgorandRawTransactionMultisigStruct
}
