/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-escape */
/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../src/index'
import { ChainEosV18 } from '../src/chains/eos_1_8/ChainEosV18'
import { ChainEthereumV1 } from '../src/chains/ethereum_1/ChainEthereumV1'
import { RpcError } from 'eosjs'
import { ChainActionType } from '../src/models'

require('dotenv').config()

// Example client code

const { env } = process
;(async () => {
  // Reusable Settings
  const kylinEndpoints = [
    {
      url: new URL('https:api-kylin.eosasia.one:443'),
      chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    },
  ]
  const oreStagingEndpoints = [
    {
      url: new URL('https://ore-staging.openrights.exchange/'),
      chainId: 'a6df478d5593b4efb1ea20d13ba8a3efc1364ee0bf7dbd85d8d756831c0e3256',
    },
  ]
  const ethEndpoint = {
    url: new URL('https://main-rpc.linkpool.io/'),
  }

  const chainSettings = { unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma' }

  // const oreStagingPrivateKey_apporeid = toEosPrivateKey('xxxx')
  // const moonlightorePrivateKey_apporeid = toEosPrivateKey('xxxx')

  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV18, kylinEndpoints, chainSettings)
  await kylin.connect()

  const oreStaging = new ChainFactory().create(ChainType.EosV18, oreStagingEndpoints, chainSettings)
  await oreStaging.connect()

  // Misc examples

  // read balance table from token contract
  console.log('create bridge balances:', await kylin.fetchContractData('createbridge', 'balances', 'createbridge'))

  // compose
  // const deleteAuthAction = kylin.composeAction(ChainActionType.AccountDeleteAuth, {
  //   authAccount: 'accountName',
  //   authPermission: 'authPermission',
  //   permission: 'permission',
  // })
  // console.log('deleteAuthAction action:', deleteAuthAction)

  // crypto
  const encrypted = kylin.encrypt('mystring', 'password', 'mysalt')
  console.log('encrypted text:', encrypted)
  const decrypted = kylin.decrypt(encrypted, 'password', 'mysalt')
  console.log('decrypted text:', decrypted)

  // error mapping
  // const err = new RpcError({
  //   message: 'Internal Service Error',
  //   error: {
  //     code: 3080002,
  //     name: 'tx_net_usage_exceeded',
  //     what: 'Transaction exceeded the current network usage limit imposed on the transaction',
  //     details: [
  //       {
  //         message: 'transaction net usage is too high: 120 > 0',
  //         file: 'transaction_context.cpp',
  //         line_number: '462',
  //         method: 'check_net_usage',
  //       },
  //     ],
  //   },
  // })
  // const chainError = kylin.mapChainError(err)
  // console.log('chainError type is:', chainError.errorType)

  /**
   * Create an Ethereum chain and call a few functions
   */
  // console.log('App: Create an Etehereum Chain.')
  // const ethChain = new ChainFactory().create(ChainType.EthereumV1, [ethEndpoint], {}) as ChainEthereumV1
  // console.log(ethChain.chainId)
})()
