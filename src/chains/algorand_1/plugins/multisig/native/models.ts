import { AlgorandRawTransactionMultisigStruct } from '../../../models/algoStructures'

export type AlgorandNativePluginOptions = {
  version: number
  threshold: number
  addrs: string[]
}

export type AlgorandMultisigCreateAccountOptions = AlgorandNativePluginOptions

export type AlgorandMultisigTransactionOptions = {
  multisigOptions?: AlgorandNativePluginOptions
  rawTransaction?: AlgorandRawTransactionMultisigStruct
}
