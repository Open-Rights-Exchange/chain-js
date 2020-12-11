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

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
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
const composeAlgoReKeyParamsToB: Partial<AlgorandActionPaymentParams> = {
  from: env.ALGOBETANET_rekeyaccount_A,
  to: env.ALGOBETANET_rekeyaccount_B,
  note: 'rekey account example a to b',
  amount: 1,
  reKeyTo: env.ALGOBETANET_rekeyaccount_B,
}

const composeAlgoReKeyParamsToA: Partial<AlgorandActionPaymentParams> = {
  from: env.ALGOBETANET_rekeyaccount_A,
  to: env.ALGOBETANET_rekeyaccount_B,
  note: 'rekey account example b to a',
  amount: 1,
  reKeyTo: env.ALGOBETANET_rekeyaccount_A,
}

async function run() {
  /** Create Algorand chain instance */
  const algoBeta = new ChainFactory().create(ChainType.AlgorandV1, algoBetanetEndpoints)
  await algoBeta.connect()
  if (algoBeta.isConnected) {
    console.log('Connected to %o', algoBeta.chainId)
  }

  /** Compose and send transaction */
  let transaction = await algoBeta.new.Transaction()
  // rekey account a to b
  let action = await algoBeta.composeAction(AlgorandChainActionType.Payment, composeAlgoReKeyParamsToB)
  transaction.actions = [action]
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([toAlgorandPrivateKey(env.ALGOBETANET_rekeyaccount_PRIVATE_KEY_A)])
  console.log('send response AtoB: %o', JSON.stringify(await transaction.send()))
  // rekey account back (b to a)
  transaction = await algoBeta.new.Transaction()
  action = await algoBeta.composeAction(AlgorandChainActionType.Payment, composeAlgoReKeyParamsToA)
  transaction.actions = [action]
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([toAlgorandPrivateKey(env.ALGOBETANET_rekeyaccount_PRIVATE_KEY_B)])

  console.log('send response BtoA: %o', JSON.stringify(await transaction.send()))
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
