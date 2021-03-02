/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import fs from 'fs'
import * as algosdk from 'algosdk'
import { ChainFactory, ChainType } from '../../../index'
import { ChainActionType, ChainEndpoint, ConfirmType, TokenTransferParams } from '../../../models'
import {
  AlgorandActionAppCreate,
  AlgorandActionAppMultiPurpose,
  AlgorandActionAppUpdate,
  AlgorandChainActionType,
  AlgorandOnApplicationComplete,
} from '../models'
import { toAlgorandPrivateKey, toAlgorandSymbol, compileIfSourceCodeIfNeeded } from '../helpers'
import { bigIntToUint8Array, hexStringToByteArray, jsonParseAndRevive, toChainEntityName } from '../../../helpers'
import { ChainAlgorandV1 } from '../ChainAlgorandV1'
import { composedAppCreate } from '../tests/mockups/composedActions'
import { rawTrxString, rawTrx, rawTrx2 } from './application/transactions'
import { AlgorandTransaction } from '../algoTransaction'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [{
  url: 'https://mainnet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://mainnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoTestnetEndpoints = [ {
  url: 'https://testnet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoBetanetEndpoints = [{
  url: 'https://betanet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://betanet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]

const composeAppOptInParams: AlgorandActionAppMultiPurpose = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'test optIn',
  appIndex: 13258116,
}

const composeAppCreateParams: Partial<AlgorandActionAppCreate> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appLocalInts: 0,
  appLocalByteSlices: 0,
  appGlobalInts: 1,
  appGlobalByteSlices: 0,
  // appApprovalProgram & appClearProgram will be added in run()
}

const sampleRawNoOPTrx = {
  type:'appl',
  from:'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appIndex:13675644, 
  appOnComplete:0, 
  appArgs: ['bWludA==', new Uint8Array([39, 16])],
  // appArgs: ['mint', '0x2710'], // same value as above 
  // appArgs: ['0x6d696e74', '0x2710'], // same value as above
  appAccounts: ['ZQHJE5D6E3NT775NKBSE6VLR6OT526F2SKOPQLHMZ2UCRUBVOEA3LIXIDM'],
}

async function generateRawTrx(algoChain: ChainAlgorandV1) {
  const appApprovalProgramSource = await fs.readFileSync('../examples/application/approval_program.teal', 'utf8')
  const appClearProgramSource = await fs.readFileSync('../examples/application/clear_state_program.teal', 'utf8')
  const approvalProgram = hexStringToByteArray(await compileIfSourceCodeIfNeeded(appApprovalProgramSource, algoChain.algoClient)) 
  const clearProgram = hexStringToByteArray(await compileIfSourceCodeIfNeeded(appClearProgramSource, algoChain.algoClient)) 
  const localInts = 8
  const localBytes = 8
  const globalInts = 10
  const globalBytes = 54
  const params = await algoChain.algoClient.getTransactionParams().do()
  const appArgs = []
  let cap: any = `8${  '0'.repeat(16)}`
  let decimals: any = '8'
  let symbol: any = 'ABCTEST'
  let name: any = 'The XYZ Test Token'
  cap = bigIntToUint8Array(cap)
  appArgs.push(cap)
  decimals = bigIntToUint8Array(decimals)
  appArgs.push(decimals)
  const enc = new TextEncoder()
  symbol = enc.encode(symbol)
  appArgs.push(symbol)
  const enc2 = new TextEncoder()
  name = enc2.encode(name)
  appArgs.push(name)
  const txn = algosdk.makeApplicationCreateTxn('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
    params, AlgorandOnApplicationComplete.OptIn,
    approvalProgram, clearProgram,
    localInts, localBytes, globalInts, globalBytes, appArgs)
  const signedTxn = algosdk.signTransaction(txn, hexStringToByteArray(env.ALGOTESTNET_testaccount_PRIVATE_KEY))
  // const sendTx = await algoTest.algoClient.sendRawTransaction(signedTxn.blob).do()
  console.log('Transaction : ', JSON.stringify(txn))
}

async function run() {
  /** Create Algorand chain instance */
  
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints) as ChainAlgorandV1
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }
  
  /** Compose and send transaction */
  const transaction = await algoTest.new.Transaction()

  // console.log(await generateRawTrx(algoTest))

  // const { applications } = await algoTest.algoClientIndexer.searchForApplications().do()
  // console.log(applications)
  // const appList = applications.map((app:any) => app?.params )

  // const apps =  appList.filter((app: any) => app?.creator === 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ')
  // console.log(apps)

  // composeAppCreateParams.appApprovalProgram = await fs.readFileSync('../examples/application/approval_program.teal', 'utf8')
  // composeAppCreateParams.appClearProgram = await fs.readFileSync('../examples/application/clear_state_program.teal', 'utf8')
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppNoOp, sampleRawNoOPTrx)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppCreate, composeAppCreateParams)
  // transaction.actions = [action]

  await transaction.setFromRaw(rawTrx)
  // // console.log('transaction actions: ', transaction)
  // // const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  // // console.log('decomposed actions: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  // // const { sk } = algosdk.mnemonicToSecretKey(env.PRIVATE_SEED)
  // // await transaction.sign([toAlgorandPrivateKey(sk)])
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  console.log('missing signatures: ', transaction.missingSignatures)
  console.log(transaction.rawTransaction)
  try {
    console.log('send response: %o', JSON.stringify(await transaction.send(ConfirmType.After001)))
  } catch (err) {
    console.log(err)
  }
}

(async () => {
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