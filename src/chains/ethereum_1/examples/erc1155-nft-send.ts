/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { TxExecutionPriority } from '../../../models'

import { toEthereumAddress } from '../helpers'
import {
  EthereumChainSettings,
  EthereumTransactionOptions,
  EthereumChainActionType,
  EthereumChainEndpoint,
} from '../models'
import { Erc1155SafeTransferFromParams } from '../templates/chainActions/chainSpecific/erc1155_safeTransferFrom'

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
        maxFeeIncreasePercentage: 20.0,
        executionPriority: TxExecutionPriority.Fast,
      },
    }

    // EthereumRawTransaction type input for setTransaction()
    // Defaults all optional properties, so you can set from raw just with to & value OR data
    const composeErc1155TransferFromParams: Erc1155SafeTransferFromParams = {
      contractAddress: toEthereumAddress('0xE5CAd93B68440F7983668F9348B774cbfb722440'), // ERC1155 Smart Contract Adddress
      transferFrom: toEthereumAddress('0xb0a807F5DF3448206217858f32bb201F068c7e1a'), // ORE Vault Multi Sig Account
      to: toEthereumAddress('0x7eFef68B9BD9342AEC2b21681426aF541343a4dD'), // Testing MetaMask Account
      tokenId: 4,
      quantity: 1,
      data: 0,
    }

    const defaultEthTxOptions: EthereumTransactionOptions<null> = {
      chain: 'rinkeby',
      hardfork: 'istanbul',
    }

    const rinkeby = new ChainFactory().create(ChainType.EthereumV1, rinkebyEndpoints, rinkebyChainOptions)
    await rinkeby.connect()

    // ---> Sign and send erc1155 transfer Transaction
    const transaction = await rinkeby.new.Transaction(rinkebyChainOptions)
    const action = await rinkeby.composeAction(
      EthereumChainActionType.ERC1155SafeTransferFrom,
      composeErc1155TransferFromParams,
    )
    // console.log(JSON.stringify(action))
    transaction.actions = [action]
    const { contract, ...actionSentToEthChain } = transaction.actions[0]
    // extract out the transaction object sent to the eth chain
    console.log('actionSentToEthChain:', actionSentToEthChain)
    // const decomposed = await rinkeby.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
