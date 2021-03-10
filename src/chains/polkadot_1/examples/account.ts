import { Chain } from '../../../interfaces'
import { ChainFactory, ChainType } from '../../../index'
import { PolkadotChainEndpoint } from '../models'

require('dotenv').config()

const westendEndpoints: PolkadotChainEndpoint[] = [
  {
    url: 'wss://westend-rpc.polkadot.io',
  },
]

const createAccountOptions = {
  // ...
}

async function createAccount(paraChain: Chain) {
  try {
    await paraChain.connect()
    const createdAccount = paraChain.new.CreateAccount(createAccountOptions)
    await createdAccount.generateKeysIfNeeded()
    console.log('generatedKeys:', createdAccount.generatedKeys)
    console.log('address:', createdAccount.accountName)
    const account = await paraChain.new.Account('5FkJuxShVBRJRirM3t3k5Y8XyDaxMi1c8hLdBsH2qeAYqAzF')
    console.log('account', account)
  } catch (error) {
    console.log(error)
  }
}

async function run() {
  try {
    const paraChainA = new ChainFactory().create(ChainType.PolkadotV1, westendEndpoints)
    const paraChainB = new ChainFactory().create(ChainType.PolkadotV1, westendEndpoints)
    const accountA = createAccount(paraChainA)
    console.log('account', accountA)
    const accountB = createAccount(paraChainB)
    console.log('account', accountB)
  } catch (error) {
    console.log(error)
  }
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
