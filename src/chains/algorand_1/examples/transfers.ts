/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import * as algosdk from 'algosdk'
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint, ChainActionType, TokenTransferParams, ValueTransferParams } from '../../../models'
import { AlgorandActionAssetTransferParams, AlgorandChainActionType, AlgorandActionPaymentParams } from '../models'
import { toAlgorandPrivateKey } from '../helpers'
import { toChainEntityName } from '../../../helpers'
import { AlgorandActionHelper } from '../algoAction'

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

// Standard chainJS action types
const composeValueTransferParams: Partial<ValueTransferParams> = {
  fromAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  toAccountName: toChainEntityName('TF6PJW7VSEKD5AXYMUXF5YGMPDUWBJQRHH4PYJISFPXAMI27PGYHKLALDY'),
  amount: '10', // 10 microalgos
  symbol: 'microalgo', // or null
  memo: 'transfer memo',
}
const composeTokenTransferParams: Partial<TokenTransferParams> = {
  contractName: toChainEntityName('10820019'),
  fromAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  toAccountName: toChainEntityName('TF6PJW7VSEKD5AXYMUXF5YGMPDUWBJQRHH4PYJISFPXAMI27PGYHKLALDY'),
  amount: '1',
  precision: 0,
  symbol: null,
  memo: 'transfer memo',
}

// algorand action types
const composeAssetTransferParams: Partial<AlgorandActionAssetTransferParams> = {
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

const payTransaction: any = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 1,
  note: 'Sample payment',
  type: 'pay',
}

const payTxWithHeaders = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 1,
  note: [174, 83, 97, 109, 112, 108, 101, 32, 112, 97, 121, 109, 101, 110, 116],
  type: 'pay',
  genesisID: 'testnet-v1.0',
  genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
  firstRound: 12286003,
  lastRound: 12287003,
  fee: 0,
  flatFee: true,
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
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetTransfer, composeAssetTransferParams)
  // const action = await algoTest.composeAction(ChainActionType.TokenTransfer, composeTokenTransferParams)
  // const action = await algoTest.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)
  // OR, set an action using params directly - values depend on the SDK requirements
  // const action = payTxWithHeaders
  transaction.actions = [action]

  // // Alternatively, set action using raw transaction
  // await transaction.setTransaction(payRawTransaction)
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed action: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()

  // const algoActionHelper = new AlgorandActionHelper(transaction.actions[0])
  // console.log('action sdkEncoded:', algoActionHelper.actionEncodedForSdk)

  console.log('required signatures (before signing): ', transaction.missingSignatures)
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  console.log('transaction signature:', transaction.signatures)
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
