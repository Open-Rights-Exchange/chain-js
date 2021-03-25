/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint, ChainActionType, ValueTransferParams } from '../../../models'
import { AlgorandAddress, AlgorandUnit, AlgorandValue, AlgorandMultiSigOptions } from '../models'
import { toAlgorandPrivateKey, determineMultiSigAddress, toAlgorandSignature } from '../helpers'
import { toChainEntityName } from '../../../helpers'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [{
  url: 'https://mainnet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://mainnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoTestnetEndpoints = [ {
  url: 'https://testnet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoBetanetEndpoints = [{
  url: 'https://betanet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://betanet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]

export const CreateAccountOptions = {
  newKeysOptions: {
    password: '2233',
  },
}

export const multiSigOptions: AlgorandMultiSigOptions = {
  version: 1,
  threshold: 2,
  addrs: [
    env.ALGOTESTNET_mulitsig_child_account1,  // 1
    env.ALGOTESTNET_mulitsig_child_account2,  // 2
    env.ALGOTESTNET_mulitsig_child_account3,  // 3
  ],
}

export const CreateMultiSigAccountOptions = {
  ...CreateAccountOptions,
  multiSigOptions,
}

const composeValueTransferParams: ValueTransferParams = {
  // fromAccountName: ... // from will be calculated from hash of multiSigOptions
  toAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  amount: '1000000',
  symbol: AlgorandUnit.Microalgo,
  memo: 'Hello World',
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }

  /** Create Algorand multisig account */
  const createMultiSigAccount = algoTest.new.CreateAccount(CreateMultiSigAccountOptions)
  await createMultiSigAccount.generateKeysIfNeeded()
  const { accountName: multiSigAccountName } = createMultiSigAccount
  console.log('mulitsig account: %o', multiSigAccountName)

  const transaction = await algoTest.new.Transaction({ multiSigOptions })
  composeValueTransferParams.fromAccountName = multiSigAccountName
  const action = await algoTest.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)
  transaction.actions = [action]
  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  // add signatures seperately
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY)])
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY)])
  // OR add them as a group
  // await transaction.sign([
  //   toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY),
  //   toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY),
  // ])

  console.log('missing signatures: ', transaction.missingSignatures)
  console.log('send response: %o', JSON.stringify(await transaction.send()))
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
