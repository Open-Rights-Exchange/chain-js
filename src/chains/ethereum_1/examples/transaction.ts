/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { BN } from 'ethereumjs-util'
import { ChainFactory, ChainType, Chain } from '../../../index'
import { ChainActionType, ChainEndpoint, PrivateKey, ConfirmType } from '../../../models'
import { ChainEthereumV1 } from '../ChainEthereumV1'
import { toEthereumPrivateKey, toWei, toEthUnit } from '../helpers'
import {
  EthereumChainSettings,
  EthereumChainForkType,
  EthereumTransactionOptions,
  EthUnit,
  EthereumBlockType,
  EthereumChainActionType,
  EthereumAddress,
} from '../models'
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
    const ropstenEndpoints: ChainEndpoint[] = [
      {
        url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
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

    interface valueTransferParams {
      fromAccountName?: EthereumAddress
      toAccountName: EthereumAddress
      tokenAmount: number | BN
      tokenSymbol?: EthUnit
    }
    const composeValueTransferParams: valueTransferParams = {
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      tokenAmount: 10,
    }

    interface tokenTransferParams {
      fromAccountName?: EthereumAddress
      toAccountName?: EthereumAddress
      tokenAmount?: number
      contractName?: EthereumAddress
    }
    const composeTokenTransferParams: tokenTransferParams = {
      contractName: '0x04825941Ad80A6a869e85606b29c9D25144E91e6',
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      tokenAmount: 20, // 0xD38ADf7D0204a6f5b7ddDe509378e43B1447CDb6
    }

    interface erc20TransferParams {
      contractAddress: EthereumAddress
      from?: EthereumAddress
      to: EthereumAddress
      value: number
    }
    const composeERC20TransferParams: erc20TransferParams = {
      contractAddress: '0x04825941Ad80A6a869e85606b29c9D25144E91e6',
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      value: 20, // 0xD38ADf7D0204a6f5b7ddDe509378e43B1447CDb6
    }

    interface erc20IssueParams {
      contractAddress: EthereumAddress
      from?: EthereumAddress
      value: number
    }
    const composeERC20IssueParams: erc20IssueParams = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      value: 20,
    }

    interface erc721TransferFromParams {
      contractAddress: EthereumAddress
      from?: EthereumAddress
      transferFrom: EthereumAddress
      to: EthereumAddress
      tokenId: number
    }
    const composeERC721TransferFromParams: erc721TransferFromParams = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      transferFrom: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
      tokenId: 1,
    }

    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {
      chainForkType: ropstenChainOptions,
    } as EthereumChainSettings)
    await ropsten.connect()

    // // ---> Sign and send ethereum transfer with compose Action
    // const transaction = await ropsten.new.Transaction()
    // transaction.actions = [ropsten.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)]
    // console.log(transaction.actions[0])
    // const decomposed = ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // // ---> Sign and send erc20 transfer Transaction
    // const transaction = await ropsten.new.Transaction()
    // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [ropsten.composeAction(EthereumChainActionType.ERC20Transfer, composeERC20TransferParams)]
    // console.log(transaction.actions[0])
    // const decomposed = ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Sign and send erc20 issue Transaction
    const transaction = await ropsten.new.Transaction()
    // await transaction.addAction(sampleTransferTrx)
    transaction.actions = [ropsten.composeAction(EthereumChainActionType.ERC20Issue, composeERC20IssueParams)]
    console.log(transaction.actions[0])
    const decomposed = ropsten.decomposeAction(transaction.actions[0])
    console.log(decomposed)
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    console.log('missing signatures: ', transaction.missingSignatures)
    console.log('send response:', JSON.stringify(await transaction.send()))

    // // ---> Sign and send ethereum transfer with setFromRaw()
    // const transaction = await ropsten.new.Transaction()
    // // await transaction.addAction(sampleTransferTrx)
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
})()
