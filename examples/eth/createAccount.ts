import { ChainFactory, ChainType } from '../../src/index'

import { ChainSettings, ChainEndpoint } from '../../src/models/generalModels'

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
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    await ropsten.connect()
    const createAccount = ropsten.new.CreateAccount(CreateAccountOptions)
    await createAccount.generatePublicKeysIfNeeded()
    console.log('generatedKeys:', createAccount.generatedKeys)
  } catch (error) {
    console.log(error)
  }
})()
