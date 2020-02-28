import { EthereumPrivateKey, EthereumAddress } from './cryptoModels'

export type EthereumAccountStruct = {
  publicKey: EthereumAddress
  privateKey: EthereumPrivateKey
}
