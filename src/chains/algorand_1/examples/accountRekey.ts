/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import * as algosdk from 'algosdk'
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint, ChainActionType, TokenTransferParams } from '../../../models'
import { AlgorandActionAssetTransferParams, AlgorandChainActionType, AlgorandActionPaymentParams, AlgorandTransactionOptions } from '../models'
import { toAlgorandPrivateKey } from '../helpers'

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
// As of Aug 2020 - Rekey feature only available on beta test net - use beta endpoints to run.
// requires transaction setup with betanet endpoints and accounts.
// example is only repeatable by each time switching between composeAlgoReKeyParamsA and B, providing the necessary private key:
// paramsA -> ALGOBETANET_rekeyaccount_PRIVATE_KEY_A,
// paramsB -> ALGOBETANET_rekeyaccount_PRIVATE_KEY_B
// next time transaction will require signature of the new address(reKeyTo)
const composeAlgoReKeyParamsA: Partial<AlgorandActionPaymentParams> = {
  from: env.ALGOBETANET_rekeyaccount_A,
  to: env.ALGOBETANET_rekeyaccount_B,
  note: 'transfer memo',
  amount: 1,
  reKeyTo: env.ALGOBETANET_rekeyaccount_B,
}

const composeAlgoReKeyParamsB: Partial<AlgorandActionPaymentParams> = {
  from: env.ALGOBETANET_rekeyaccount_A,
  to: env.ALGOBETANET_rekeyaccount_B,
  note: 'transfer memo',
  amount: 1,
  reKeyTo: env.ALGOBETANET_rekeyaccount_A,
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoBetanetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }

  /** Compose and send transaction */
  const transaction = await algoTest.new.Transaction()

  // Compose an action from basic parameters using composeAction function
  const action = await algoTest.composeAction(AlgorandChainActionType.Payment, composeAlgoReKeyParamsB)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetTransfer, composeAlgoReKeyParamsB)
  // OR, set an action using params directly - values depend on the SDK requirements
  // const action = composeAlgoPaymentParams
  transaction.actions = [action]

  // // Alternatively, set action using raw transaction
  // await transaction.setFromRaw(algosdk.encodeObj(payRawTransaction))
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed action: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  
  console.log('required signatures (before signing): ', transaction.missingSignatures)
  await transaction.sign([toAlgorandPrivateKey(env.ALGOBETANET_rekeyaccount_PRIVATE_KEY_B)])
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
