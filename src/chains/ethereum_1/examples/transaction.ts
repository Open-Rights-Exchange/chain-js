/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { BN } from 'ethereumjs-util'
import { ChainFactory, ChainType, Chain } from '../../../index'
import { ChainActionType, PrivateKey, TokenTransferParams, ValueTransferParams } from '../../../models'
import { ChainEthereumV1 } from '../ChainEthereumV1'
import { toEthereumPrivateKey, toWei, toEthereumSymbol, fromTokenValueString } from '../helpers'
import { toChainEntityName } from '../../../helpers'
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

import { erc20Abi } from '../templates/abis/erc20Abi'
import { erc721Abi } from '../templates/abis/erc721Abi'

require('dotenv').config()

const prepTransactionFromActions = async (chain: Chain, transactionActions: any, key: PrivateKey) => {
  console.log('actions:', transactionActions)
  const transaction = (chain as ChainEthereumV1).new.Transaction()
  transaction.actions = transactionActions
  await transaction.prepareToBeSigned()
  await transaction.validate()
  transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

const { env } = process
;(async () => {
  try {
    const ropstenEndpoints: EthereumChainEndpoint[] = [
      {
        url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
        // Web3 HttpProvider options - https://github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-http#usage
        // options: {
        //   timeout: 20000,
        //   headers: [{ header_name: 'header-value' }],
        // },
      },
    ]

    const ropstenChainOptions: EthereumChainForkType = {
      chainName: 'ropsten',
      hardFork: 'istanbul',
    }

    // EthereumRawTransaction type input for setFromRaw()
    // Defaults all optional properties, so you can set from raw just with to & value OR data
    const sampleSetFromRawTrx = {
      to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
      value: toWei(10, EthUnit.Milliether),
      //  data: '0x00',
      //  gasPrice: '0x00',
      //  gasLimit: '0x00',
    }

    const composeValueTransferParams: ValueTransferParams = {
      toAccountName: toChainEntityName('0x27105356F6C1ede0e92020e6225E46DC1F496b81'),
      amount: '0.000000000000000033',
      symbol: toEthereumSymbol(EthUnit.Ether),
    }

    const composeTokenTransferParams: TokenTransferParams = {
      contractName: toChainEntityName('0x04825941Ad80A6a869e85606b29c9D25144E91e6'),
      toAccountName: toChainEntityName('0x27105356F6C1ede0e92020e6225E46DC1F496b81'),
      symbol: toEthereumSymbol(EthUnit.Wei),
      // precision: 18, // precision should be provided if possible
      amount: '20.000000000000000000', // if precision isn't specified, token precision is infered from the number of digits after the decimal place
    }

    const composeERC20TransferParams: Erc20TransferParams = {
      contractAddress: '0x04825941Ad80A6a869e85606b29c9D25144E91e6',
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      precision: 18, // precision should be provided if possible
      value: '20',
    }

    const composeERC20IssueParams: Erc20IssueParams = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      precision: 18, // precision should be provided if possible
      value: '20',
    }

    const composeERC721TransferFromParams: Erc721TransferFromParams = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      transferFrom: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
      tokenId: 1,
    }

    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {
      chainForkType: ropstenChainOptions,
    } as EthereumChainSettings)
    await ropsten.connect()

    // ---> Sign and send ethereum transfer with compose Action - using generic (cross-chain) native chain transfer action
    const transaction = await ropsten.new.Transaction()
    transaction.actions = [ropsten.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)]
    console.log(transaction.actions[0])
    const decomposed = ropsten.decomposeAction(transaction.actions[0])
    console.log(JSON.stringify(decomposed))
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    console.log('missing signatures: ', transaction.missingSignatures)
    console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Sign and send default transfer Transaction - using generic (cross-chain) token transfer action
    // const transaction = await ropsten.new.Transaction()
    // transaction.actions = [ropsten.composeAction(ChainActionType.TokenTransfer, composeTokenTransferParams)]
    // console.log(transaction.actions[0])
    // const decomposed = ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // console.log(
    //   'token value converted back using precision:',
    //   fromTokenValueString(decomposed[0]?.args?.amount, 10, composeTokenTransferParams?.precision),
    // )
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Sign and send erc20 transfer Transaction
    // const transaction = await ropsten.new.Transaction()
    // transaction.actions = [ropsten.composeAction(EthereumChainActionType.ERC20Transfer, composeERC20TransferParams)]
    // console.log(transaction.actions[0])
    // const decomposed = ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // console.log(
    //   'token value converted back using precision:',
    //   fromTokenValueString(decomposed[0]?.args?.amount, 10, composeERC20TransferParams?.precision),
    // )
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Sign and send erc20 issue Transaction
    // const transaction = await ropsten.new.Transaction()
    // transaction.actions = [ropsten.composeAction(EthereumChainActionType.ERC20Issue, composeERC20IssueParams)]
    // console.log(transaction.actions[0])
    // const decomposed = ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // // ---> Sign and send ethereum transfer with setFromRaw()
    // const transaction = await ropsten.new.Transaction()
    // await transaction.setFromRaw(sampleSetFromRawTrx)
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Compose & Decompose erc721 transferFrom Transaction
    // const transaction = await ropsten.new.Transaction()
    // transaction.actions = [
    //   ropsten.composeAction(EthereumChainActionType.ERC721TransferFrom, composeERC721TransferFromParams),
    // ]
    // console.log(transaction.actions[0])
    // const decomposed = ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
