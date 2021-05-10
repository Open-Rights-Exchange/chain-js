import { EthereumNewKeysOptions } from './generalModels'
import { EthereumPublicKey } from './cryptoModels'
import { MultisigOptions } from '../../../models'

export type EthereumCreateAccountOptions = {
  publicKey?: EthereumPublicKey
  newKeysOptions?: EthereumNewKeysOptions
  multisigOptions: MultisigOptions
}

/** Type of account to create */
export enum EthereumNewAccountType {
  /** Native account for chain type (Ethereum, etc.) */
  Native = 'Native',
}
