/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import * as algosdk from 'algosdk'
import { ChainFactory, ChainType } from '../../../index'
import { AlgorandTransactionOptions } from '../models'
import { toAlgorandPrivateKey } from '../helpers'
import { AlgorandTransaction } from '..'
import { ChainAlgorandV1 } from '../ChainAlgorandV1'

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

const payTx1 = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 1,
  type: 'pay',
}

const payTx2 = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 2,
  type: 'pay',
}


async function run() {
  /** Create Algorand chain instance */
  const algoBeta = new ChainFactory().create(ChainType.AlgorandV1, algoBetanetEndpoints) as ChainAlgorandV1
  await algoBeta.connect()
  if (algoBeta.isConnected) {
    console.log('Connected to %o', algoBeta.chainId)
  }

  const options: AlgorandTransactionOptions = { 
    expireSeconds: 3600, // tx only valid for the next hour
  }


  const suggestedParams = await algoBeta.algoClient.getTransactionParams().do()

  // calculate groupID to attach into setTransaction()
  const algoTrx1 = algosdk.makePaymentTxnWithSuggestedParams(payTx1.from, payTx1.to, payTx1.amount, undefined, undefined, suggestedParams)
  const algoTrx2 = algosdk.makePaymentTxnWithSuggestedParams(payTx2.from, payTx2.to, payTx2.amount, undefined, undefined, suggestedParams)
  const group = Buffer.from(algosdk.computeGroupID([algoTrx1, algoTrx2])).toString('base64')

  const payTxWithHeaders1 = {
    ...payTx1,
    ...suggestedParams,
    group,
  }
  const payTxWithHeaders2 = {
    ...payTx2,
    ...suggestedParams,
    group,
  }

  /** Compose and send transaction */
  const transaction1 = await algoBeta.new.Transaction(options) as AlgorandTransaction
  const transaction2 = await algoBeta.new.Transaction(options) as AlgorandTransaction

  await transaction1.setTransaction(payTxWithHeaders1)
  await transaction2.setTransaction(payTxWithHeaders2)

  await transaction1.prepareToBeSigned()
  await transaction1.validate()
  await transaction2.prepareToBeSigned()
  await transaction2.validate()

  await transaction1.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  await transaction2.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])

  console.log('Trx1 ID: ', transaction1.transactionId)
  console.log('Trx2 ID: ', transaction2.transactionId)

  const signedTransaction1 = new Uint8Array(algosdk.encodeObj(transaction1.rawTransaction))
  const signedTransaction2 = new Uint8Array(algosdk.encodeObj(transaction2.rawTransaction))
  
  console.log('send response: %o', JSON.stringify(await algoBeta.algoClient.sendRawTransaction([signedTransaction1, signedTransaction2]).do()))
  // Sample group trx: https://betanet.algoexplorer.io/tx/group/JwuHTCKow8hslOIf9tSHcoVS2AdSLM0jvzW5WfFI6oo%3D
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
