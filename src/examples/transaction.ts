/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { toEosEntityName } from '../chains/eos_2/helpers'
import { ChainFactory, ChainType } from '../index'
import { ChainActionType, ChainEndpoint } from '../models'
import { toEthereumPrivateKey } from '../chains/ethereum_1/helpers'
import { EthereumChainSettings, EthereumChainForkType } from '../chains/ethereum_1/models'

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

const ethComposeValueTransferParams = {
  toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
  amount: 10,
}
const eosComposeValueTransferParams = {
  fromAccountName: toEosEntityName('oreidfunding'),
  toAccountName: toEosEntityName('proppropprop'),
  amount: 10,
}
const ethComposeTokenTransferParams = {
  toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
  amount: 10,
}
const eosComposeTokenTransferParams = {
  fromAccountName: toEosEntityName('oreidfunding'),
  toAccountName: toEosEntityName('proppropprop'),
  amount: 10,
  symbol: 'EOS',
  permission: toEosEntityName('active'),
}

const platforms = [
  {
    chain: kylin,
    privateKey: env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY,
    composeValueTransferParams: eosComposeValueTransferParams,
    composeTokenTransferParams: eosComposeTokenTransferParams,
  },
  {
    chain: ropsten,
    privateKey: toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY),
    composeValueTransferParams: ethComposeValueTransferParams,
    composeTokenTransferParams: ethComposeTokenTransferParams,
  },
]

async function runner(platform: any) {
  try {
    const { chain, privateKey, composeValueTransferParams, composeTokenTransferParams } = platform
    await chain.connect()
    console.log(privateKey)

    // // ---> Sign and send ethereum transfer with compose Action
    // const transaction = await chain.new.Transaction()
    // transaction.actions = [chain.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)]
    // console.log(transaction.actions[0])
    // const decomposed = chain.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([privateKey])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    //   // ---> Sign and send erc20 transfer Transaction
    //   const transaction = await chain.new.Transaction()
    //   transaction.actions = [chain.composeAction(ChainActionType.TokenTransfer, composeTokenTransferParams)]
    //   console.log(transaction.actions[0])
    //   const decomposed = chain.decomposeAction(transaction.actions[0])
    //   console.log(decomposed)
    //   await transaction.prepareToBeSigned()
    //   await transaction.validate()
    //   await transaction.sign([privateKey])
    //   console.log('missing signatures: ', transaction.missingSignatures)
    //   console.log('send response:', JSON.stringify(await transaction.send()))
  } catch (error) {
    console.log(error)
  }
}
;(async () => {
  try {
    platforms.forEach(platform => {
      runner(platform)
    })
  } catch (err) {
    console.log(err)
  }
})()
