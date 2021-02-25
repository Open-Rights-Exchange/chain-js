/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint, ChainActionType, TxExecutionPriority, ConfirmType } from '../../../models'
import { AlgorandAddress, AlgorandUnit, AlgorandValue } from '../models'
import { toAlgorandPrivateKey } from '../helpers'
import { AlgorandTransaction } from '../algoTransaction'
import { AlgorandChainState } from '../algoChainState'
import { ChainAlgorandV1 } from '../ChainAlgorandV1'
import { jsonParseAndRevive } from '../../../helpers'

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

interface valueTransferParams {
  fromAccountName?: AlgorandAddress
  toAccountName: AlgorandAddress
  amount: number
  symbol?: AlgorandUnit
  memo: AlgorandValue
}

const composeValueTransferParams: valueTransferParams = {
  fromAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  toAccountName: 'GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A',
  amount: 1000000,
  symbol: AlgorandUnit.Microalgo,
  memo: 'Hello World',
}

const rawTransaction =
  '{"txn":{"amt":1,"fee":1000,"fv":12552955,"lv":12553955,"note":{"type":"Buffer","data":[174,83,97,109,112,108,101,32,112,97,121,109,101,110,116]},"snd":{"type":"Buffer","data":[50,233,108,32,251,215,163,12,235,155,51,32,227,133,22,178,236,50,125,181,113,142,2,115,133,117,199,201,228,230,235,93]},"type":"pay","gen":"testnet-v1.0","gh":{"type":"Buffer","data":[72,99,181,24,164,179,200,78,200,16,242,45,79,16,129,203,15,113,240,89,167,172,32,222,198,47,127,112,229,9,58,34]},"rcv":{"type":"Buffer","data":[168,101,164,68,116,110,137,242,164,216,34,161,122,2,23,221,236,191,81,161,78,114,147,135,226,72,217,99,209,87,1,164]}}}'

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }
  /** Compose and send transaction */
  const transaction = algoTest.new.Transaction()
  // await transaction.setFromRaw(jsonParseAndRevive(rawTransaction))
  const action = await algoTest.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)
  transaction.actions = [action]
  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  const suggestedFee = await transaction.getSuggestedFee(TxExecutionPriority.Average)
  console.log('suggestedFee: ', suggestedFee)
  await transaction.setDesiredFee(suggestedFee)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  console.log('missing signatures: ', transaction.missingSignatures)
  try {
    console.log('send response: %o', JSON.stringify(await transaction.send(ConfirmType.None)))
    // console.log('send response: %o', JSON.stringify(await transaction.send(ConfirmType.After001)))
    // console.log('actual fee: ', await transaction.getActualCost()) // will throw if tx not yet on-chain e.g. If transaction.send uses ConfirmType.None
  } catch (err) {
    console.log(err)
  }
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
