import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models'

require('dotenv').config()

const algoPureStakeTestnet = 'https://testnet-algorand.api.purestake.io/ps1'

export const algoTestnetEndpoints: ChainEndpoint[] = [
  {
    url: new URL(algoPureStakeTestnet),
    settings: {
      token: {
        'X-API-Key': '7n0G2itKl885HQQzEfwtn4SSE1b6X3nb6zVnUw99',
      },
    },
  },
]

export const CreateAccountOptions = {
  newKeysOptions: {
    password: '2233',
  },
}
;(async () => {
  // Create an Algo chain instance and call a few functions
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoPureStakeTestnet)
  }
  const createAccount = algoTest.new.CreateAccount(CreateAccountOptions)
  await createAccount.generateKeysIfNeeded()
  console.log('generatedKeys:', createAccount.generatedKeys)
  console.log('address:', createAccount.accountName)
})()
