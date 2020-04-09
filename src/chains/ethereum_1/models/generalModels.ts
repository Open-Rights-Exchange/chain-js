import { BN } from 'ethereumjs-util'
import { EncryptedDataString, ChainEntityNameBrand, ChainAssetBrand, ChainDateBrand } from '../../../models'
import { EthereumPrivateKey, EthereumPublicKey } from './cryptoModels'

export type EthereumDate = string & ChainDateBrand // Datetime string in the format YYYY-MM-DDTHH:MM:SS.sss
export type EthereumAsset = BN & ChainAssetBrand
export type EthereumEntityName = string & ChainEntityNameBrand

export type EthereumNewKeysOptions = {
  password?: string
  salt?: string
}

export type EthereumGeneratedKeys = {
  publicKey: EthereumPublicKey
  privateKey: EthereumPrivateKey | EncryptedDataString
}

export type EthereumString = {
  string: string
}

// similar to ethereum-js BufferLike but also includes string
export type EthereumValue = string | number | Buffer
