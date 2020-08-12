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

const composeTokenTransferParams: Partial<AlgorandActionAssetTransferParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'TF6PJW7VSEKD5AXYMUXF5YGMPDUWBJQRHH4PYJISFPXAMI27PGYHKLALDY',
  note: 'transfer memo',
  amount: 1,
  assetIndex: 10820019,
}

const composeAlgoPaymentParams: Partial<AlgorandActionPaymentParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'TF6PJW7VSEKD5AXYMUXF5YGMPDUWBJQRHH4PYJISFPXAMI27PGYHKLALDY',
  note: 'transfer memo',
  amount: 1,
}

// raw transaction ('blob' returned from the Algo SDK transaction sign function)
const payRawTransaction: any = {
  txn:{
    amt: 7,
    fee: 70224000,
    fv: 8431331,
    lv: 8432331,
    note: [173,116,114,97,110,115,102,101,114,32,109,101,109,111],
    snd: [168,101,164,68,116,110,137,242,164,216,34,161,122,2,23,221,236,191,81,161,78,114,147,135,226,72,217,99,209,87,1,164],
    type: 'pay',
    gen: 'testnet-v1.0',
    gh: [72,99,181,24,164,179,200,78,200,16,242,45,79,16,129,203,15,113,240,89,167,172,32,222,198,47,127,112,229,9,58,34],
    rcv: [153,124,244,219,245,145,20,62,130,248,101,46,94,224,204,120,233,96,166,17,57,248,252,37,18,43,238,6,35,95,121,176],
  },
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

  // Compose an action from basic parameters using composeAction function
  const action = await algoTest.composeAction(AlgorandChainActionType.Payment, composeAlgoPaymentParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetTransfer, composeTokenTransferParams)
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
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
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
