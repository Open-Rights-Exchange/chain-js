// eslint-disable-next-line import/no-cycle
import { AlgorandMultisigNativeOptions } from '../plugins/multisig/native/models'
import { AlgorandPublicKey } from './cryptoModels'
import { AlgorandNewKeysOptions } from './generalModels'

export type AlgorandCreateAccountOptions = {
  publicKey?: AlgorandPublicKey
  newKeysOptions?: AlgorandNewKeysOptions
  multisigOptions?: AlgorandMultisigNativeOptions
}

/** Type of account to create */
export enum AlgorandNewAccountType {
  /** Native account for chain type (Algorand, etc.) */
  Native = 'Native',
}
