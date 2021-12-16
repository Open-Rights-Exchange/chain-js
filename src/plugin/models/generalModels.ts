import { Algodv2, Indexer } from 'algosdk'
// import { ChainSettingsCommunicationSettings, ChainSymbolBrand, ModelsCryptoEd25519 } from '../../../models'
import { Models } from '@open-rights-exchange/chainjs'
import { AlgorandAddress, AlgorandKeyPair } from './cryptoModels'
import { AlgorandChainTransactionParamsStruct } from './algoStructures'

export type AlgoClient = Algodv2
export type AlgoClientIndexer = Indexer

/** Chain urls and related details used to connect to chain */
export type AlgorandChainEndpoint = {
  /** api endpoint url - including http(s):// prefix */
  url: string
  /** Options are name/value pairs used to configure chain endpoint */
  options?: {
    /** Algorand indexer endpoint url - including http(s):// prefix */
    indexerUrl?: string
    /** Array of headers to be included in HTTP requests to chain endpoint
     *  e.g. options.headers = [{"Authorization":"Bearer..."}] */
    headers?: [{ [key: string]: string }]
  }
  /** Between 0 and 1 - 0 is not responding, 1 is very fast */
  health?: number
}

/**
 * Algorand token: {'x-api-key': '...'}
 */
export type AlgorandHeader = {
  'x-api-key': string
}

/** Chain information including head block number and time and software version */
export type AlgorandChainInfo = {
  headBlockNumber: number
  headBlockTime: Date
  version: string
  nativeInfo: {
    transactionHeaderParams: AlgorandChainTransactionParamsStruct
  }
}

/** Currently nothing is needed in algorand chain settings.
 * Once any such parameter is there, change the type from any to an object containing specific properties */
export type AlgorandChainSettings = {
  communicationSettings?: Models.ChainSettingsCommunicationSettings
  defaultTransactionSettings?: {
    expireSeconds?: number
    fee?: AlgorandValue
    flatFee?: boolean
  }
}

/**  Multisig options required to create a multisignature account for Algorand */
export type AlgorandMultisigOptions = {
  version: number
  threshold: number
  addrs: AlgorandAddress[]
}

/** multisig options for creating an account */
export type AlgorandMultisigCreateAccountOptions = AlgorandMultisigOptions

/** multisig options for signing a transaction */
export type AlgorandMultisigTransactionOptions = AlgorandMultisigOptions

/**  Algorand multisig account is similar to a native algorand address */
export type AlgorandMultisigAccount = AlgorandAddress

/**  Algorand keys generated for a new account */
export type AlgorandGeneratedKeys = AlgorandKeyPair

/**  Algorand new keys options including password and optional multisig parameters */
export type AlgorandNewKeysOptions = {
  password: string
  encryptionOptions?: Models.ModelsCryptoEd25519.Ed25519PasswordEncryptionOptions
}

/** Algorand value units */
export enum AlgorandUnit {
  Microalgo = 'microalgo',
  Algo = 'algo',
}

/** Algorand general value type */
export type AlgorandValue = string | number | Buffer | Uint8Array
export type AlgorandSymbol = string & Models.ChainSymbolBrand
