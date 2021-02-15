import { ChainFactory, ChainType } from '../../../index'
import { PolkadotChainEndpoint } from '../models'

require('dotenv').config()

const { env } = process

const westendEndpoints: PolkadotChainEndpoint[] = [
  {
    url: 'wss://westend-rpc.polkadot.io'
  }
]

const createAccountOptions = {
}
;(async () => {
  try {
    const westend = new ChainFactory().create(ChainType.PolkadotV1, westendEndpoints)
    await westend.connect()
    const createAccount = westend.new.CreateAccount(createAccountOptions)
    await createAccount.generateKeysIfNeeded()
    console.log('generatedKeys:', createAccount.generatedKeys)
    console.log('address:', createAccount.accountName)
    const account = await westend.new.Account('5FkJuxShVBRJRirM3t3k5Y8XyDaxMi1c8hLdBsH2qeAYqAzF')
    console.log('account', account)
    // const { password, salt } = createAccountOptions.newKeysOptions
    // const decryptedPrivateKey = ropsten.decryptWithPassword(createAccount.generatedKeys.privateKey, password, { salt })
    // console.log('decrypted privateKey: ', decryptedPrivateKey)
  } catch (error) {
    console.log(error)
  }
})()
process.exit()