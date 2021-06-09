/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { EthereumChainEndpoint } from '../models'

require('dotenv').config()

const { env } = process

const ropstenEndpoints: EthereumChainEndpoint[] = [
  {
    url: 'https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
  },
]

const createAccountOptions = {
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0,
  },
}
;(async () => {
  try {
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
    await ropsten.connect()
    const createAccount = await ropsten.new.CreateAccount(createAccountOptions)
    await createAccount.generateKeysIfNeeded()
    console.log('generatedKeys:', createAccount.generatedKeys)
    console.log('address:', createAccount.accountName)
    const account = await ropsten.new.Account('0x3f0def554abb0107c08237361bba7e2b99906a48')
    console.log('account', account)
    const { password, salt } = createAccountOptions.newKeysOptions
    const decryptedPrivateKey = ropsten.decryptWithPassword(createAccount.generatedKeys.privateKey, password, { salt })
    console.log('decrypted privateKey: ', decryptedPrivateKey)
  } catch (error) {
    console.log(error)
  }
})()
