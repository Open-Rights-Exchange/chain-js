// eslint-disable-next-line import/no-cycle
import { AlgorandPublicKey } from './cryptoModels'
import { AlgorandMultisigOptions, AlgorandNewKeysOptions } from './generalModels'

export type AlgorandCreateAccountOptions = {
  publicKey?: AlgorandPublicKey
  newKeysOptions?: AlgorandNewKeysOptions
  multisigOptions?: AlgorandMultisigOptions
}

/** Type of account to create */
export enum AlgorandNewAccountType {
  /** Native account for chain type (Algorand, etc.) */
  Native = 'Native',
}
