/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { BN } from 'ethereumjs-util'
import { toEosSymbol, toEosEntityName } from '../chains/eos_2/helpers'
import { erc20Abi } from '../chains/ethereum_1/templates/abis/erc20Abi'
import { erc721Abi } from '../chains/ethereum_1/templates/abis/erc721Abi'
import { ChainFactory, ChainType, Chain } from '../index'
import { ChainActionType, ChainEndpoint, PrivateKey, ConfirmType } from '../models'
import { ChainEthereumV1 } from '../chains/ethereum_1/ChainEthereumV1'
import { toEthereumPrivateKey, toWei, toEthUnit } from '../chains/ethereum_1/helpers'
import {
  EthereumChainSettings,
  EthereumChainForkType,
  EthereumTransactionOptions,
  EthUnit,
  EthereumBlockType,
  EthereumChainActionType,
  EthereumAddress,
} from '../chains/ethereum_1/models'

require('dotenv').config()

const { env } = process

const kylinEndpoints = [
  {
    url: new URL('https:api-kylin.eosasia.one:443'),
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
  },
]

const chainSettings = { unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma' }

const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]

const ropstenChainOptions: EthereumChainForkType = {
  chainName: 'ropsten',
  hardFork: 'istanbul',
}

const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {
  chainForkType: ropstenChainOptions,
} as EthereumChainSettings)

const kylin = new ChainFactory().create(ChainType.EosV2, kylinEndpoints, chainSettings)

const chain = ropsten
// const chain = kylin

const privateKey = env.ROPSTEN_erc20acc_PRIVATE_KEY
  // const privateKey = env.ORE_TESTNET_APPOREID_PRIVATE_KEY
;(async () => {
  try {
    await chain.connect()

    // EthereumRawTransaction type input for setFromRaw()
    // Defaults all optional properties, so you can set from raw just with to & value OR data
    const sampleSetFromRawTrx = {
      to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
      value: toWei(10, EthUnit.Milliether),
      //  data: '0x00',
      //  gasPrice: '0x00',
      //  gasLimit: '0x00',
    }

    const ethComposeValueTransferParams = {
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      amount: 10,
    }

    const eosComposeValueTransferParams = {
      toAccountName: toEosEntityName('oreappid'),
      amount: 10,
      symbol: toEosSymbol('EOS'),
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

    // // ---> Sign and send ethereum transfer with compose Action
    const transaction = await chain.new.Transaction()
    transaction.actions = [chain.composeAction(ChainActionType.ValueTransfer, ethComposeValueTransferParams)]
    console.log(transaction.actions[0])
    const decomposed = chain.decomposeAction(transaction.actions[0])
    console.log(decomposed)
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.sign([toEthereumPrivateKey(privateKey)])
    console.log('missing signatures: ', transaction.missingSignatures)
    console.log('send response:', JSON.stringify(await transaction.send()))

    // // ---> Sign and send erc20 transfer Transaction
    // const transaction = await chain.new.Transaction()
    // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [chain.composeAction(ChainActionType.TokenTransfer, composeERC20TransferParams)]
    // console.log(transaction.actions[0])
    // const decomposed = chain.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(privateKey)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Sign and send erc20 issue Transaction
    // const transaction = await chain.new.Transaction()
    // // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [chain.composeAction(ChainActionType.TokenIssue, composeERC20IssueParams)]
    // console.log(transaction.actions[0])
    // const decomposed = chain.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(privateKey)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // // ---> Sign and send ethereum transfer with setFromRaw()
    // const transaction = await chain.new.Transaction()
    // // await transaction.addAction(sampleTransferTrx)
    // await transaction.setFromRaw(sampleSetFromRawTrx)
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(privateKey)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Compose & Decompose erc721 transferFrom Transaction
    // const transaction = await chain.new.Transaction()
    // transaction.actions = [
    //   chain.composeAction(EthereumChainActionType.ERC721TransferFrom, composeERC721TransferFromParams),
    // ]
    // console.log(transaction.actions[0])
    // const decomposed = chain.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
  } catch (error) {
    console.log(error)
  }
})()
