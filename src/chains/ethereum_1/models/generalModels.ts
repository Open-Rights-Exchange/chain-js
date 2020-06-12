import { BN } from 'ethereumjs-util'
import BigNumber from 'bignumber.js'
import { EncryptedDataString, ChainEntityNameBrand, ChainAssetBrand, ChainDateBrand } from '../../../models'
import { EncryptionOptions, EthereumPrivateKey, EthereumPublicKey } from './cryptoModels'

/** Category of chain functions - useful in error mapping */
export enum ChainFunctionCategory {
  Block = 'Block',
  ChainState = 'ChainState',
  Contract = 'Contract',
  Transaction = 'Transaction',
}

export enum EthereumBlockType {
  Earliest = 'earliest',
  Genesis = 'genesis',
  Latest = 'latest',
  Pending = 'pending',
}

/** Chain configuation for creating a new chain connection and sending transaction */
export type EthereumChainSettings = {
  chainForkType?: EthereumChainForkType
}

export type EthereumChainForkType = {
  chainName: string
  hardFork: string
}

/** Chain urls and related details used to connect to chain */
export type EthereumChainEndpoint = {
  /** api endpoint url - including http(s):// prefix */
  url: URL
  /** Options are same as defined in web3-core-helpers.HttpProviderOptions - https://github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-http#usage
   *  Except: Headers are provided here as {'headerName':'headerValue'} and mapped to EthereumHttpHeader format {name:string, value:string} */
  options?: {
    keepAlive?: boolean
    timeout?: number
    /** Array of headers to be included in HTTP requests to chain endpoint
     *  e.g. options.headers = [{"Authorization":"Bearer..."}] */
    headers?: [{ [key: string]: string }]
    withCredentials?: boolean
    /** Type HttpAgent - from web3-core-helpers */
    agent?: any
  }
  /** between 0 and 1 - 0 is not responding, 1 is very fast */
  health?: number
}

/** For future use - add any settings needed to customize communication with API endpoint */
export type EthereumChainSettingsCommunicationSettings = {}

export type EthereumAsset = BN & ChainAssetBrand
export type EthereumBlockNumber = string | number | BN | BigNumber | EthereumBlockType
export type EthereumDate = string & ChainDateBrand // Datetime string in the format YYYY-MM-DDTHH:MM:SS.sss
export type EthereumEntityName = string & ChainEntityNameBrand

export type EthereumGeneratedKeys = {
  publicKey: EthereumPublicKey
  privateKey: EthereumPrivateKey | EncryptedDataString
}

export type EthereumNewKeysOptions = {
  password: string
  encryptionOptions?: EncryptionOptions
}

export type EthereumString = {
  string: string
}

// similar to ethereum-js BufferLike but also includes string
export type EthereumValue = string | number | Buffer | BN

/** Ethereum value units */
export enum EthUnit {
  Noether = 'noether',
  Wei = 'wei',
  Kwei = 'kwei',
  Babbage = 'babbage',
  femtoether = 'femtoether',
  Mwei = 'mwei',
  Lovelace = 'lovelace',
  Picoether = 'picoether',
  Qwei = 'gwei',
  Gwei = 'Gwei',
  Shannon = 'shannon',
  Nanoether = 'nanoether',
  Nano = 'nano',
  Szabo = 'szabo',
  Microether = 'microether',
  Micro = 'micro',
  Finney = 'finney',
  Milliether = 'milliether',
  Milli = 'milli',
  Ether = 'ether',
  Kether = 'kether',
  Grand = 'grand',
  Mether = 'mether',
  Gether = 'gether',
  Thether = 'tether',
}
