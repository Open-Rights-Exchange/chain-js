import { ChainFactory, PluginChainFactory } from './chainFactory'
import { ChainError, throwNewError } from './errors'
import { Account, Chain, CreateAccount, Transaction, ChainJsPlugin, ChainJsPluginOptions } from './interfaces'
import * as AlgorandV1 from './chains/algorand_1'
//import * as EthereumV1 from './chains/ethereum_1'
//import { ChainEthereumV1 } from './chains/ethereum_1/ChainEthereumV1'
import * as Crypto from './crypto'
import * as Models from './models'
import * as ModelsAlgorand from './chains/algorand_1/models'
//import * as ModelsEthereum from './chains/ethereum_1/models'
import * as HelpersAlgorand from './chains/algorand_1/helpers'
//import * as HelpersEthereum from './chains/ethereum_1/helpers'
import * as Helpers from './helpers'
import * as Interfaces from './interfaces'
import * as Errors from './errors'
import * as CryptoHelpers from './crypto/genericCryptoHelpers'
import * as CryptoAsymmetricModels from './crypto/asymmetricModels'
import * as CryptoAsymmetricHelpers from './crypto/asymmetricHelpers'
import * as PluginInterfaces from './interfaces/plugins/multisig'

const { ChainType } = Models

export {
  Account,
  Chain,
  ChainError,
  throwNewError,
  ChainFactory,
  ChainType,
  CreateAccount,
  Crypto,
  AlgorandV1,
  Helpers,
  HelpersAlgorand,
  Models,
  ModelsAlgorand,
  Transaction,
  ChainJsPlugin, //Needs to be moved to the plugin
  ChainJsPluginOptions, //Needs to be moved to the plugin
  Interfaces,
  Errors, //Note that individual errors are also returned. These need to be removed byt will break existing code 
  CryptoHelpers,
  CryptoAsymmetricModels,
  CryptoAsymmetricHelpers,
  PluginChainFactory,
  PluginInterfaces
}

// Note the code using chain specific helpers will also break. 
// So if external code is importing somethin like 
// import { HelpersEos } from '@open-rights-exchange/chainjs'
// That will now need to be imported from the EOS plugin 
// Unless we leave the code in chain-js main

// Note that the multichain example has been removed from examples/multichain etc.
// This example will now need to live outside the chain-js library