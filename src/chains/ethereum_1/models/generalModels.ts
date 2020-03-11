import { EncryptedDataString, ChainEntityNameBrand } from '../../../models'
import { EthereumPrivateKey, EthereumPublicKey } from './cryptoModels'

export type EthereumEntityName = string & ChainEntityNameBrand

export type EthereumNewKeysOptions = {
  password?: string
  salt?: string
}

export type EthereumGeneratedKeys = {
  publicKey: EthereumPublicKey
  privateKey: EthereumPrivateKey | EncryptedDataString
}
