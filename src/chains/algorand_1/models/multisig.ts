import { AlgorandMultisigPlugin } from '../plugins/algorandMultisigPlugin'
import { AlgorandRawTransactionMultisigStruct } from './algoStructures'
import { AlgorandAddress } from './cryptoModels'

export interface AlgorandMultisigPluginInput {
  multiSigOptions?: AlgorandMultiSigOptions
  raw?: AlgorandRawTransactionMultisigStruct
}

/**  Multisig options required to create a multisignature account for Algorand */
export type AlgorandMultiSigOptions = {
  version: number
  threshold: number
  addrs: AlgorandAddress[]
  plugin?: AlgorandMultisigPlugin
}
