import { EthereumPrivateKey, EthereumAddress, EthereumPublicKey } from './cryptoModels'

export type EthereumAccountStruct = {
  address: EthereumAddress
  publicKey: EthereumPublicKey
  privateKey: EthereumPrivateKey
}
