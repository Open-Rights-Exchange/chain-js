/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { BN } from 'ethereumjs-util'
import { ChainFactory, ChainType, Chain } from '../../../index'
import {
  ChainActionType,
  ConfirmType,
  PrivateKey,
  TokenTransferParams,
  TxExecutionPriority,
  ValueTransferParams,
} from '../../../models'
import { ChainEthereumV1 } from '../ChainEthereumV1'
import { toEthereumAddress, toEthereumPrivateKey, toEthereumSymbol } from '../helpers'
import { fromTokenValueString, toChainEntityName } from '../../../helpers'
import {
  EthereumChainSettings,
  EthereumChainForkType,
  EthereumTransactionOptions,
  EthUnit,
  EthereumBlockType,
  EthereumChainActionType,
  EthereumAddress,
  EthereumChainEndpoint,
} from '../models'
import { Erc20TransferParams } from '../templates/chainActions/chainSpecific/erc20_transfer'
import { Erc20IssueParams } from '../templates/chainActions/chainSpecific/erc20_issue'
import { Erc721TransferFromParams } from '../templates/chainActions/chainSpecific/erc721_transferFrom'
import { EthTransferParams } from '../templates/chainActions/chainSpecific/eth_transfer'
import { EthereumTransaction } from '../ethTransaction'

require('dotenv').config()

const { env } = process
;(async () => {
  try {
    const rinkebyEndpoints: EthereumChainEndpoint[] = [
      {
        url: 'https://rinkeby.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
        // Web3 HttpProvider options - https://github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-http#usage
        // options: {
        //   timeout: 20000,
        //   headers: [{ header_name: 'header-value' }],
        // },
      },
    ]

    const rinkebyChainOptions: EthereumChainSettings = {
      chainForkType: {
        chainName: 'rinkeby',
        hardFork: 'istanbul',
      },
      defaultTransactionSettings: {
        maxFeeIncreasePercentage: 20,
        executionPriority: TxExecutionPriority.Fast,
      },
    }

    // EthereumRawTransaction type input for setTransaction()
    // Defaults all optional properties, so you can set from raw just with to & value OR data

    const composeERC20TransferParams: Erc20TransferParams = {
      contractAddress: toEthereumAddress('0x0db8a3d251d4064b775b3e2c1efb086ae2256614'),
      from: toEthereumAddress('0x27105356F6C1ede0e92020e6225E46DC1F496b81'),
      to: toEthereumAddress('0x7A25fa08fd0b4F5348E6aE188BeB72b0b5A0B7F5'),
      precision: 18, // precision should be provided if possible
      value: '20',
    }

    // null: Multisig plugin not specified
    const defaultEthTxOptions: EthereumTransactionOptions<null> = {
      chain: 'rinkeby',
      hardfork: 'istanbul',
    }

    const rinkeby = new ChainFactory().create(ChainType.EthereumV1, rinkebyEndpoints, rinkebyChainOptions)
    await rinkeby.connect()

    // ---> Sign and send erc20 transfer Transaction
    const transaction = await rinkeby.new.Transaction(rinkebyChainOptions)
    const action = await rinkeby.composeAction(EthereumChainActionType.ERC20Transfer, composeERC20TransferParams)
    // console.log(JSON.stringify(action))
    transaction.actions = [action]
    const { contract, ...actionSentToEthChain } = transaction.actions[0]
    // extract out the transaction object sent to the eth chain
    console.log('actionSentToEthChain:', actionSentToEthChain)
    const decomposed = await rinkeby.decomposeAction(transaction.actions[0])
    console.log(decomposed)
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
