import { AlgorandPublicKey } from './cryptoModels'
import { AlgorandNewKeysOptions } from './generalModels'

export type AlgorandCreateAccountOptions = {
  publicKey?: AlgorandPublicKey
  newKeysOptions?: AlgorandNewKeysOptions
}

/** Type of account to create */
export enum AlgorandNewAccountType {
  /** Native account for chain type (Algorand, etc.) */
  Native = 'Native',
}
