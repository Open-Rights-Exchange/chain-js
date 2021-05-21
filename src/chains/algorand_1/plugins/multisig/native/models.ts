import { AlgorandRawTransactionMultisigStruct } from '../../../models/algoStructures'

export type AlgorandMultisigNativeOptions = {
  version: number
  threshold: number
  addrs: string[]
}

export type AlgorandNativeMultisigCreateAccountOptions = AlgorandMultisigNativeOptions

export type AlgorandNativeMultisigTransactionOptions = {
  multisigOptions?: AlgorandMultisigNativeOptions
  rawTransaction?: AlgorandRawTransactionMultisigStruct
}
