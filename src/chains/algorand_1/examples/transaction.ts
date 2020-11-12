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

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }
  /** Compose and send transaction */
  const transaction = await algoTest.new.Transaction()
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
    console.log('send response: %o', JSON.stringify(await transaction.send(ConfirmType.After001)))
    // Using ConfirmType.None for transaction.send might make getActualCost return null
    console.log('actual fee: ', await transaction.getActualCost())
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
