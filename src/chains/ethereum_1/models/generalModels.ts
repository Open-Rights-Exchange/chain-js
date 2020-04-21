import { BN } from 'ethereumjs-util'
import BigNumber from 'bignumber.js'
import { EncryptedDataString, ChainEntityNameBrand, ChainAssetBrand, ChainDateBrand } from '../../../models'
import { EthereumPrivateKey, EthereumPublicKey } from './cryptoModels'

/** Category of chain functions - useful in error mapping */
export enum ChainFunctionCategory {
  Block = 'Block',
  ChainState = 'ChainState',
  Contract = 'Contract',
  Transaction = 'Transaction',
}

export type EthereumAsset = BN & ChainAssetBrand
export type EthereumBlockNumber = number | BN | BigNumber | 'latest' | 'pending' | 'earliest' | 'genesis'
export type EthereumDate = string & ChainDateBrand // Datetime string in the format YYYY-MM-DDTHH:MM:SS.sss
export type EthereumEntityName = string & ChainEntityNameBrand

export type EthereumGeneratedKeys = {
  publicKey: EthereumPublicKey
  privateKey: EthereumPrivateKey | EncryptedDataString
}

export type EthereumNewKeysOptions = {
  password?: string
  salt?: string
}

export type EthereumString = {
  string: string
}

// similar to ethereum-js BufferLike but also includes string
export type EthereumValue = string | number | Buffer
