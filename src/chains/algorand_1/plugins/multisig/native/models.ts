import { AlgorandRawTransactionMultisigStruct } from '../../../models/algoStructures'

export type AlgorandNativeMultisigOptions = {
  version: number
  threshold: number
  addrs: string[]
}

export type AlgorandNativeMultisigCreateAccountOptions = AlgorandNativeMultisigOptions

export type AlgorandNativeMultisigTransactionOptions = {
  multisigOptions?: AlgorandNativeMultisigOptions
  rawTransaction?: AlgorandRawTransactionMultisigStruct
}
