import { AlgorandMultisigOptions } from '../../../models/generalModels'
import { AlgorandRawTransactionMultisigStruct } from '../../../models/algoStructures'

export type AlgorandMultisigNativeCreateAccountOptions = AlgorandMultisigOptions

export type AlgorandMultisigNativeTransactionOptions = {
  multisigOptions?: AlgorandMultisigOptions
  rawTransaction?: AlgorandRawTransactionMultisigStruct
}
