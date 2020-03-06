import { EthereumNewKeysOptions } from './generalModels'
import { EthereumPublicKey } from './cryptoModels'

/** Type of account to create */
export enum EthereumNewAccountType {
  /** Native account for chain type (Ethereum, etc.) */
  Native = 'Native',
}

export type EthereumCreateAccountOptions = {
  publicKey: EthereumPublicKey
  newKeysOptions?: EthereumNewKeysOptions
}
