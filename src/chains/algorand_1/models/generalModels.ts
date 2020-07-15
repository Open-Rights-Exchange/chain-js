import { EncryptedDataString, ChainSymbolBrand } from '../../../models'
import { AlgorandAddress, AlgorandPublicKey, AlgorandPrivateKey } from './cryptoModels'

export type AlgoClient = any

/** Chain urls and related details used to connect to chain */
export type AlgorandChainEndpoint = {
  /** api endpoint url - including http(s):// prefix */
  url: URL
  /** Options are name/value pairs used to configure chain endpoint */
  options?: {
    /** Array of headers to be included in HTTP requests to chain endpoint
     *  e.g. options.headers = [{"Authorization":"Bearer..."}] */
    headers?: [{ [key: string]: string }]
  }
  /** Between 0 and 1 - 0 is not responding, 1 is very fast */
  health?: number
}

/**
 * Algorand token: {'X-API-Key': '...'}
 */
export type AlgorandHeader = {
  'X-API-Key': string
}

/** Currently nothing is needed in algorand chain settings.
 * Once any such parameter is there, change the type from any to an object containing specific properties */
export type AlgorandChainSettings = any

/**  Currently nothing is needed in algorand chain communication settings. 
 Once any such parameter is there, change the type from any to an object containing specific properties */
export type AlgorandChainSettingsCommunicationSettings = any

/**  Multisig options required to create a multisignature account for Algorand */
export type AlgorandMultiSigOptions = {
  version: number
  threshold: number
  addrs: AlgorandAddress[]
}

/**  Algorand multisig account is similar to a native algorand address */
export type AlgorandMultiSigAccount = AlgorandAddress

/**  Algorand generated keys  after an account is created */
export type AlgorandGeneratedKeys = {
  publicKey: AlgorandPublicKey
  privateKey?: AlgorandPrivateKey | EncryptedDataString
}

/**  Algorand new keys options including password and optional multisig parameters */
export type AlgorandNewKeysOptions = {
  password: string
  salt: string
}

/** Algorand value units */
export enum AlgorandUnit {
  Microalgo = 'microalgo',
  Algo = 'algo',
}

/** Algorand general value type */
export type AlgorandValue = string | number | Buffer
export type AlgorandSymbol = string & ChainSymbolBrand
