import { AlgorandRawTransactionMultisigStruct } from '../../../models/algoStructures'

export type AlgorandNativeCreateAccountOptions = {
  version: number
  threshold: number
  addrs: string[]
}

export type AlgorandNativeTransactionOptions = {
  multisigOptions?: AlgorandNativeCreateAccountOptions
  rawTransaction?: AlgorandRawTransactionMultisigStruct
}
