/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { ChainFactory, ChainType } from '../../../index'
import { ChainActionType, ChainEndpoint, TokenTransferParams } from '../../../models'
import {
  AlgorandActionAppCreate,
  AlgorandActionAppMultiPurpose,
  AlgorandActionAppUpdate,
  AlgorandChainActionType,
} from '../models'
import { toAlgorandPrivateKey, toAlgorandSymbol } from '../helpers'
import { toChainEntityName } from '../../../helpers'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [{
  url: new URL('https://mainnet-algorand.api.purestake.io/ps2'),
  options: { indexerUrl: new URL('https://mainnet-algorand.api.purestake.io/idx2'), headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoTestnetEndpoints = [ {
  url: new URL('https://testnet-algorand.api.purestake.io/ps2'),
  options: { indexerUrl: new URL('https://testnet-algorand.api.purestake.io/idx2'), headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoBetanetEndpoints = [{
  url: new URL('https://betanet-algorand.api.purestake.io/ps2'),
  options: { indexerUrl: new URL('https://betanet-algorand.api.purestake.io/idx2'), headers: [{ 'x-api-key': algoApiKey }] },
}]

const composeAppOptInParams: AlgorandActionAppMultiPurpose = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'test optIn',
  appIndex: 13258116,
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }

  /** Compose and send transaction */
  const transaction = await algoTest.new.Transaction()
  const action = await algoTest.composeAction(AlgorandChainActionType.AppOptIn, composeAppOptInParams)

  transaction.actions = [action]
  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
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

// ... For OptIn Test ...
// transaction actions:  {
//   name: 'Transaction',
//   tag: 'TX',
//   from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
//   fee: 1000,
//   firstRound: 11047681,
//   lastRound: 11048681,
//   note: 'test optIn',
//   genesisID: 'testnet-v1.0',
//   genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
//   appIndex: 13258116,
//   appOnComplete: 1,
//   type: 'appl',
//   flatFee: true
// }
// decomposed actions:  [
//   {
//     chainActionType: 'AppOptIn',
//     args: {
//       name: 'Transaction',
//       tag: 'TX',
//       from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
//       note: 'test optIn',
//       appIndex: 13258116,
//       appOnComplete: 1,
//       type: 'appl'
//     }
//   }
// ]