import { EthereumNewKeysOptions } from './generalModels'
import { EthereumPublicKey } from './cryptoModels'

export type EthereumCreateAccountOptions<PluginMultisigOptions> = {
  publicKey?: EthereumPublicKey
  newKeysOptions?: EthereumNewKeysOptions
  multisigOptions?: PluginMultisigOptions
}

/** Type of account to create */
export enum EthereumNewAccountType {
  /** Native account for chain type (Ethereum, etc.) */
  Native = 'Native',
}
