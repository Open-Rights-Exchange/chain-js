import { ChainFactory } from './chainFactory'
import { ChainError, throwNewError } from './errors'
import { Account, Chain, CreateAccount, Transaction, ChainJsPlugin, ChainJsPluginOptions } from './interfaces'
import * as AlgorandV1 from './chains/algorand_1'
import * as EthereumV1 from './chains/ethereum_1'
import { ChainEthereumV1 } from './chains/ethereum_1/ChainEthereumV1'
import * as Crypto from './crypto'
import * as Models from './models'
import * as ModelsAlgorand from './chains/algorand_1/models'
import * as ModelsEthereum from './chains/ethereum_1/models'
import * as HelpersAlgorand from './chains/algorand_1/helpers'
import * as HelpersEthereum from './chains/ethereum_1/helpers'
import * as Helpers from './helpers'
import * as Interfaces from './interfaces'
import * as Errors from './errors'
import * as CryptoHelpers from './crypto/genericCryptoHelpers'
import * as CryptoAsymmetricModels from './crypto/asymmetricModels'
import * as CryptoAsymmetricHelpers from './crypto/asymmetricHelpers'

const { ChainType } = Models

export {
  Account,
  Chain,
  ChainEthereumV1,
  ChainError,
  throwNewError,
  ChainFactory,
  ChainType,
  CreateAccount,
  Crypto,
  AlgorandV1,
  EthereumV1,
  Helpers,
  HelpersAlgorand,
  HelpersEthereum,
  Models,
  ModelsAlgorand,
  ModelsEthereum,
  Transaction,
  ChainJsPlugin, //Needs to be moved to the plugin
  ChainJsPluginOptions, //Needs to be moved to the plugin
  Interfaces,
  Errors, //Note that individual errors are also returned. These need to be removed byt will break existing code 
  CryptoHelpers,
  CryptoAsymmetricModels,
  CryptoAsymmetricHelpers
}
