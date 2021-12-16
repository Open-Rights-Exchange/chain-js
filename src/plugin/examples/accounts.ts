/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// import { ChainFactory, ChainType } from '../../../index'
// import { ChainEndpoint } from '../../../models'
import { Models, ChainFactory, Helpers } from '@open-rights-exchange/chainjs'
import { toAlgorandPrivateKey, toAlgorandPublicKey } from '../helpers'


require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [
  {
    url: 'https://mainnet-algorand.api.purestake.io/ps2',
    options: { indexerUrl: 'https://mainnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
  },
]
const algoTestnetEndpoints = [
  {
    url: 'https://testnet-algorand.api.purestake.io/ps2',
    options: { indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
  },
]
const algoBetanetEndpoints = [
  {
    url: 'https://betanet-algorand.api.purestake.io/ps2',
    options: { indexerUrl: 'https://betanet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
  },
]

export const createAccountOptions = {
  newKeysOptions: {
    password: '2233',
    encryptionOptions: {
      salt: 'salt',
      N: 65536,
    },
  },
}

export const createMultiSigAccountOptions = {
  ...createAccountOptions,
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(Models.ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }

  /** Create Algorand account */
  const createAccount = await algoTest.new.CreateAccount(createAccountOptions)
  await createAccount.generateKeysIfNeeded()
  const { accountName, generatedKeys } = createAccount
  console.log('generatedKeys: %o', generatedKeys)
  console.log('account name: %o', accountName)
  const account = await algoTest.new.Account(accountName)
  console.log('account: %o', account.name)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
