/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, Chain } from '../index'
import { ChainActionType, ChainEndpoint, ConfirmType, ChainEntityNameBrand, ChainType } from '../models'
import { EthereumChainForkType } from '../chains/ethereum_1/models'

require('dotenv').config()

const { env } = process

// Eos chain creation options (for Kylin test network)
const kylinEndpoints = [
  {
    url: 'https:api-kylin.eosasia.one:443',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
  },
]

// Ethereum chain creation options (for Ropsten test network)
const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: 'https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
  },
]
const ropstenChainOptions: EthereumChainForkType = {
  chainName: 'ropsten',
  hardFork: 'istanbul',
}

// Example set of options to send tokens for each chain type
const chainSendTokenData = {
  eos: {
    privateKey: env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY,
    composeTokenTransferParams: {
      fromAccountName: 'oreidfunding',
      toAccountName: 'proppropprop',
      amount: '0.1000',
      symbol: 'EOS',
      permission: 'active',
    },
  },
  ethereum: {
    privateKey: env.ROPSTEN_erc20acc_PRIVATE_KEY,
    composeTokenTransferParams: {
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      amount: '.0000000001',
      precision: 18,
      symbol: 'eth',
    },
  },
}

// Example set of options to send currency (which is just sending a value between accounts) for each chain type
const chainSendCurrencyData = {
  eos: {
    privateKey: env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY,
    composeValueTransferParams: {
      fromAccountName: 'oreidfunding',
      toAccountName: 'proppropprop',
      amount: '0.0050',
    },
  },
  ethereum: {
    privateKey: env.ROPSTEN_erc20acc_PRIVATE_KEY,
    composeValueTransferParams: {
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      amount: '15',
    },
  },
}

/** Transfer token between accounts (uses most popular token type for each chain - e.g. ERC20 on Ethereum) */
async function sendToken(chain: Chain, options: any) {
  const sendTokenTx = await chain.new.Transaction()
  sendTokenTx.actions = [await chain.composeAction(ChainActionType.TokenTransfer, options.composeTokenTransferParams)]
  await sendTokenTx.prepareToBeSigned()
  await sendTokenTx.validate()
  await sendTokenTx.sign([options.privateKey])
  const response = await sendTokenTx.send(ConfirmType.None)
  return response
}

/** Send 'cryptocurrency' (value) between accounts on the chain */
async function sendCurrency(chain: Chain, options: any) {
  const sendCurrencyTx = await chain.new.Transaction()
  sendCurrencyTx.actions = [
    await chain.composeAction(ChainActionType.ValueTransfer, options.composeValueTransferParams),
  ]
  await sendCurrencyTx.prepareToBeSigned()
  await sendCurrencyTx.validate()
  await sendCurrencyTx.sign([options.privateKey])
  const response = await sendCurrencyTx.send(ConfirmType.None)
  return response
}

/** Run the same functions (e.g. transfer a token) for one or more chains using the same code */
async function runFunctionsForMultipleChains() {
  const chains = [
    new ChainFactory().create(ChainType.EosV2, kylinEndpoints),
    new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, { chainForkType: ropstenChainOptions }),
  ]

  // for each chain, connect to its network (to make sure the endpoint is available)
  await Promise.all(
    chains.map(async chain => {
      await chain.connect()
    }),
  )

  // Send Tokens - for each chain, we'll get token option and call the generic sendToken function
  await Promise.all(
    chains.map(async chain => {
      const { chainType } = chain
      const tokenData = chainType === ChainType.EosV2 ? chainSendTokenData.eos : chainSendTokenData.ethereum
      const response = await sendToken(chain, tokenData)
      console.log(`---> sendToken ${chain.chainType} response:`, JSON.stringify(response))
    }),
  )

  // Send 'Currency' - for each chain, sends the native currency for the chain (e.g. 'eth' for Ethereum)
  await Promise.all(
    chains.map(async chain => {
      const { chainType } = chain
      const currencyData = chainType === ChainType.EosV2 ? chainSendCurrencyData.eos : chainSendCurrencyData.ethereum
      const response = await sendCurrency(chain, currencyData)
      console.log(`---> sendCurrency ${chain.chainType} response:`, JSON.stringify(response))
    }),
  )
}

/** Run the example code automatically */
;(async () => {
  try {
    await runFunctionsForMultipleChains()
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
