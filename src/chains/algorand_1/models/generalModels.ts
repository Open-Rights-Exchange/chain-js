import { EncryptedDataString } from '../../../models'
import { AlgorandAddress, AlgorandPublicKey, AlgorandPrivateKey } from './cryptoModels'

export type AlgoClient = any

/**
 * server: chain endpoint
 * token: api token required to access the chain network
 * token's format: {'X-API-Key': '...'}
 */
export type AlgorandConnectionSettings = {
  server: URL
  token: string
  port?: string
}

/** Currently nothing is needed in algorand chain settings.
 * Once any such parameter is there, change the type from any to an object containing specific properties */
export type AlgorandChainSettings = any

/**  Currently nothing is needed in algorand chain communication settings. 
 Once any such parameter is there, change the type from any to an object containing specific properties */
export type AlgorandChainSettingsCommunicationSettings = any

/**  Multisig options required to create a multisignature account for Algorand */
export type AlgorandMultiSigOptions = {
  version: Number
  threshold: Number
  accounts: AlgorandAddress[]
}

/**  Algorand multisig account is similar to a native algorand address */
export type AlgorandMutliSigAccount = AlgorandAddress

/**  Algorand generated keys  after an account is created */
export type AlgorandGeneratedKeys = {
  publicKey: AlgorandPublicKey
  privateKey?: AlgorandPrivateKey | EncryptedDataString
}

/**  Algorand new keys options including password and optional multisig parameters */
export type AlgorandNewKeysOptions = {
  password: string
  multiSigOptions?: AlgorandMultiSigOptions
}
