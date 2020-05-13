import { ChainFactory } from './chainFactory'
import { ChainError } from './errors'
import { Account, Chain, CreateAccount, Transaction } from './interfaces'
import * as EosV18 from './chains/eos_1_8'
import { ChainEosV18 } from './chains/eos_1_8/ChainEosV18'
import { ChainEthereumV1 } from './chains/ethereum_1/ChainEthereumV1'
import * as Ethereum10 from './chains/ethereum_1'
import * as Models from './models'
import * as ModelsEos from './chains/eos_1_8/models'
import * as ModelsEthereum from './chains/ethereum_1/models'

const { ChainType } = Models

export {
  Account,
  Chain,
  ChainEosV18,
  ChainEthereumV1,
  ChainError,
  ChainFactory,
  ChainType,
  CreateAccount,
  EosV18,
  Ethereum10,
  Models,
  ModelsEos,
  ModelsEthereum,
  Transaction,
}
