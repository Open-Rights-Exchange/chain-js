import { BN } from 'ethereumjs-util'
import BigNumber from 'bignumber.js'
import {
  ChainDateBrand,
  ChainEntityNameBrand,
  ChainSettingsCommunicationSettings,
  ChainSymbolBrand,
  ModelsCryptoAes,
  TxExecutionPriority,
} from '../../../models'
import { EthereumKeyPair } from './cryptoModels'

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
  communicationSettings?: ChainSettingsCommunicationSettings
  defaultTransactionSettings: {
    executionPriority: TxExecutionPriority
    maxFeeIncreasePercentage?: number
  }
}

export type EthereumChainForkType = {
  chainName: string
  hardFork: string
}

export type EthereumChainInfo = {
  headBlockNumber: number
  headBlockTime: Date
  version: string
  nativeInfo: EthereumNativeChainInfo
}

export type EthereumNativeChainInfo = {
  chainId: number
  gasLimit: number
  gasUsed: number
  /** current chain gas price in Wei */
  currentGasPrice: string
}

/** Chain urls and related details used to connect to chain */
export type EthereumChainEndpoint = {
  /** api endpoint url - including http(s):// prefix */
  url: string
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

export type EthereumChainSettingsCommunicationSettings = {
  blocksToCheck: number
  checkInterval: number
  getBlockAttempts: number
}

export type EthereumBlockNumber = string | number | BN | BigNumber | EthereumBlockType
export type EthereumDate = string & ChainDateBrand // Datetime string in the format YYYY-MM-DDTHH:MM:SS.sss
export type EthereumEntityName = string & ChainEntityNameBrand
export type EthereumSymbol = string & ChainSymbolBrand

export type EthereumGeneratedKeys = EthereumKeyPair

export type EthereumNewKeysOptions = {
  password: string
  encryptionOptions?: ModelsCryptoAes.AesEncryptionOptions
}

export type EthereumString = {
  string: string
}

// similar to ethereum-js BufferLike but also includes string
export type EthereumMultiValue = string | number | Buffer | BN

/** Ethereum value units */
// See: https://www.languagesandnumbers.com/articles/en/ethereum-ether-units
export enum EthUnit {
  Noether = 'noether', // 0
  Wei = 'wei', // 1 Wei
  Kwei = 'kwei', // 1000 Wei
  femtoether = 'femtoether', // 1000 Wei
  Lovelace = 'lovelace', // 1,000 Wei
  Mwei = 'mwei', // 1,000,000 Wei
  Babbage = 'babbage', // 1,000,000 Wei
  Picoether = 'picoether', // 1,000,000 Wei
  Qwei = 'gwei', // 1,000,000,000 Wei
  Gwei = 'Gwei', // 1,000,000,000 Wei
  Shannon = 'shannon', // 1,000,000,000 Wei
  Nanoether = 'nanoether', // 1,000,000,000 Wei
  Nano = 'nano', // 1,000,000,000 Wei
  Szabo = 'szabo', // 1,000,000,000,000 Wei
  Microether = 'microether', // 1,000,000,000,000 Wei
  Micro = 'micro', // 1,000,000,000,000 Wei
  Finney = 'finney', // 1,000,000,000,000,000 Wei
  Milliether = 'milliether', // 1,000,000,000,000,000 Wei
  Milli = 'milli', // 1,000,000,000,000,000 Wei
  Ether = 'ether', // 1,000,000,000,000,000,000 Wei
  Kether = 'kether', // 1000 Eth
  Grand = 'grand', // 1000 Eth
  Mether = 'mether', // 1,000,000 Eth
  Gether = 'gether', // 1,000,000,000 Eth
  Thether = 'tether', // 1,000,000,000,000 Eth
}
