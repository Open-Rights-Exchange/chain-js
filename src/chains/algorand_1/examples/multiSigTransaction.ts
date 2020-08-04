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

export const CreateAccountOptions = {
  newKeysOptions: {
    password: '2233',
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

export const CreateMultiSigAccountOptions = {
  ...CreateAccountOptions,
  multiSigOptions,
}

const composeValueTransferParams: ValueTransferParams = {
  fromAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  toAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  amount: '1000000',
  symbol: AlgorandUnit.Microalgo,
  memo: 'Hello World',
}
;(async () => {
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
  const decomposed = algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  // add signatures seperately
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY)])
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY)])
  console.log('signatures: ', transaction.signatures)
  const sig1 = transaction.signatures[0]
  const sig2 = transaction.signatures[1]
  // transaction.signatures = null
  // transaction.addSignatures([toAlgorandSignature(sig1)])
  // console.log('signatures: ', transaction.signatures)
  transaction.addSignatures([toAlgorandSignature(sig2)])
  // console.log('signatures: ', transaction.signatures)
  // OR add them as a group
  // await transaction.sign([
  //   toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY),
  //   toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY),
  // ])

  console.log('missing signatures: ', transaction.missingSignatures)
  console.log('send response: %o', JSON.stringify(await transaction.send()))
})()
