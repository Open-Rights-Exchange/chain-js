/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// import { ChainFactory, ChainType } from '../../../index'
// import { ChainEndpoint, ChainActionType, ValueTransferParams } from '../../../models'
import { Models, ChainFactory, Helpers } from '@open-rights-exchange/chainjs'
import { AlgorandAddress, AlgorandMultisigOptions, AlgorandUnit, AlgorandValue } from '../models'
import { toAlgorandPrivateKey } from '../helpers'
// import { toChainEntityName } from '../../../helpers'



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

const transactionMultisigOptions: AlgorandMultisigOptions = {
  version: 1,
  threshold: 2,
  addrs: [
    env.ALGOTESTNET_mulitsig_child_account1,
    env.ALGOTESTNET_mulitsig_child_account2,
    env.ALGOTESTNET_mulitsig_child_account3,
  ],
}

export const transactionOptions = {
  multisigOptions: transactionMultisigOptions,
}

const composeValueTransferParams: Models.ValueTransferParams = {
  fromAccountName: Helpers.toChainEntityName('U7KCCCPAGTHL3IQGEG2SUTIKCZR55RUZZ4H2VCHAWSJ6AYT25KHGDLUD7A'),
  toAccountName: Helpers.toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  amount: '1000000',
  symbol: AlgorandUnit.Microalgo,
  memo: 'Hello World',
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(Models.ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }

  const transaction = await algoTest.new.Transaction(transactionOptions)
  const action = await algoTest.composeAction(Models.ChainActionType.ValueTransfer, composeValueTransferParams)
  transaction.actions = [action]
  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  // add signatures seperately
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY)])
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY)])
  // await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account3_PRIVATE_KEY)])
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
