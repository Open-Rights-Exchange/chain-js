import { EthereumNewKeysOptions } from './generalModels'
import { EthereumPublicKey } from './cryptoModels'

export type EthereumCreateAccountOptions = {
  publicKey?: EthereumPublicKey
  newKeysOptions?: EthereumNewKeysOptions
  multisigOptions?: any
}

/** Type of account to create */
export enum EthereumNewAccountType {
  /** Native account for chain type (Ethereum, etc.) */
  Native = 'Native',
}
