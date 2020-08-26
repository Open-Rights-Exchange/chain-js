/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models'
import { AlgorandMultiSigOptions } from '../models'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY
const algoMainnetEndpoints = [{ 
  url: new URL('https://mainnet-algorand.api.purestake.io/ps1'),
  options: { headers: [ { 'X-API-Key': algoApiKey } ] }, 
}]
const algoTestnetEndpoints = [{ 
  url: new URL('https://testnet-algorand.api.purestake.io/ps1'),
  options: { headers: [ { 'X-API-Key': algoApiKey } ] }, 
}]
const algoBetanetEndpoints = [{ 
  url: new URL('https://betanet-algorand.api.purestake.io/ps1'),
  options: { headers: [ { 'X-API-Key': algoApiKey } ] }, 
}]

export const createAccountOptions = {
  newKeysOptions: {
    password: '2233',
    salt: 'salt',
  },
}

export const multiSigOptions: AlgorandMultiSigOptions = {
  version: 1,
  threshold: 2,
  addrs: [
    env.ALGOTESTNET_mulitsig_child_account1,
    env.ALGOTESTNET_mulitsig_child_account2,
    env.ALGOTESTNET_mulitsig_child_account3,
  ],
}

export const createMultiSigAccountOptions = {
  ...createAccountOptions,
  multiSigOptions,
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }

  /** Create Algorand account */
  const createAccount = algoTest.new.CreateAccount(createAccountOptions)
  await createAccount.generateKeysIfNeeded()
  const { accountName, generatedKeys } = createAccount
  console.log('generatedKeys: %o', generatedKeys)
  console.log('decrypted privateKey: ', algoTest.decrypt(generatedKeys.privateKey, createAccountOptions.newKeysOptions.password, { salt: createAccountOptions.newKeysOptions.salt}))
  console.log('account name: %o', accountName)
  const account = await algoTest.new.Account(accountName)
  console.log('account: %o', account.name)

  // /** Create Algorand multisig account */
  // const createMultiSigAccount = algoTest.new.CreateAccount(createMultiSigAccountOptions)
  // await createMultiSigAccount.generateKeysIfNeeded()
  // const { accountName: multiSigAccountName } = createMultiSigAccount
  // console.log('mulitsig account: %o', multiSigAccountName)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
