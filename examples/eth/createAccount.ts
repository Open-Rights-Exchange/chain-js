import { ChainFactory, ChainType } from '../../src/index'

import { ChainSettings, ChainEndpoint } from '../../src/models/generalModels'
import { EthereumNewAccountType } from '../../src/chains/ethereum_1/models'

// import { ChainEthereumV1 } from '../../src/chains/ethereum_1/ChainEthereumV1'

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
    console.log(await ropsten.chainInfo)
    const createAccount = ropsten.new.CreateAccount()
    const { requiresTransaction } = createAccount
    if (createAccount.requiresTransaction) {
    }
    if (!requiresTransaction) {
      const account = await createAccount.generateAccount(EthereumNewAccountType.Native, CreateAccountOptions)
      console.log(account)
    }
  } catch (error) {
    console.log(error)
  }
})()
