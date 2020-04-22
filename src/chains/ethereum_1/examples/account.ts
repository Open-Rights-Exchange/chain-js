/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models/generalModels'

require('dotenv').config()

export const { env } = process

export const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]

export const CreateAccountOptions = {
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0,
  },
}
;(async () => {
  try {
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
    await ropsten.connect()
    const createAccount = ropsten.new.CreateAccount(CreateAccountOptions)
    await createAccount.generateKeysIfNeeded()
    console.log('generatedKeys:', createAccount.generatedKeys)
    console.log('address:', createAccount.accountName)
    const account = await ropsten.new.Account('0x3f0def554abb0107c08237361bba7e2b99906a48')
    console.log('account', account)
  } catch (error) {
    console.log(error)
  }
})()
