import { ChainFactory, ChainType } from '../../../index'
import { PolkadotChainEndpoint, PolkadotChainSettings } from '../models'

require('dotenv').config()

const { env } = process

/**
 * Rococo relay-chain in which parachain features are availalbe. One of Polkadot testnet
 */
const rococoEndpoints: PolkadotChainEndpoint = {
  url: 'wss://rococo-rpc.polkadot.io'
};

/**
 * One of parachains connected to Rococo network
 */
const tickEndpoints: PolkadotChainEndpoint = {
  url: 'wss://tick-rpc.polkadot.io'
}

const tickChainSettings: PolkadotChainSettings = {
  relayEndpoint: rococoEndpoints,
  otherParachains: []
}

const createAccountOptions = {
};

(async () => {
  try {
    const chain = new ChainFactory().create(ChainType.PolkadotV1, [tickEndpoints], tickChainSettings)
    await chain.connect()
    console.debug(chain.chainInfo)

    const createAccount = chain.new.CreateAccount(createAccountOptions)
    await createAccount.generateKeysIfNeeded()
    // console.log('generatedKeys:', createAccount.generatedKeys)
    // console.log('address:', createAccount.accountName)
    const account = await chain.new.Account('5FkJuxShVBRJRirM3t3k5Y8XyDaxMi1c8hLdBsH2qeAYqAzF')
    // console.log('account', account)
    
    // const { password, salt } = createAccountOptions.newKeysOptions
    // const decryptedPrivateKey = ropsten.decryptWithPassword(createAccount.generatedKeys.privateKey, password, { salt })
    // console.log('decrypted privateKey: ', decryptedPrivateKey)

    process.exit()
  } catch (error) {
    console.log(error)
  }
})()