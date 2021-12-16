/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import fs from 'fs'
import * as algosdk from 'algosdk'
// import { ChainFactory, ChainType } from '../../../index'
// import { ChainActionType, ChainEndpoint, ConfirmType, TokenTransferParams } from '../../../models'
import { Models, ChainFactory, Helpers } from '@open-rights-exchange/chainjs'
import {
  AlgorandActionAppCreateParams,
  AlgorandActionAppMultiPurposeParams,
  AlgorandActionAppUpdateParams,
  AlgorandChainActionType,
} from '../models'
import { toAlgorandPrivateKey, toAlgorandSymbol } from '../helpers'
// import { toChainEntityName } from '../../../helpers'
import ChainAlgorandV1  from '../ChainAlgorandV1'
import { composedAppCreate } from '../tests/mockups/composedActions'



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

const composeAppCreateParams: Partial<AlgorandActionAppCreateParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appLocalInts: 0,
  appLocalByteSlices: 0,
  appGlobalInts: 1,
  appGlobalByteSlices: 0,
  // appApprovalProgram & appClearProgram will be added in run()
}
const composeAppUpdateParams: Partial<AlgorandActionAppMultiPurposeParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appIndex: 13379916,
  // appApprovalProgram & appClearProgram will be added in run()
}
const composeAppOptInParams: AlgorandActionAppMultiPurposeParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'test optIn',
  appIndex: 13379916,
}
const composeAppNoOpParams: Partial<AlgorandActionAppMultiPurposeParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appIndex: 13379916,
}
const composeAppCloseOutParams: Partial<AlgorandActionAppMultiPurposeParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appIndex: 13379916,
}
const composeAppClearParams: Partial<AlgorandActionAppMultiPurposeParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appIndex: 13379916,
}
const composeAppDeleteParams: Partial<AlgorandActionAppMultiPurposeParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  appIndex: 13379919,
}

const sampleRawNoOPTrx = {
  type:'appl',
  from:'ZQHJE5D6E3NT775NKBSE6VLR6OT526F2SKOPQLHMZ2UCRUBVOEA3LIXIDM',
  appIndex:13675644, 
  appOnComplete:0, 
  appArgs: ['bWludA==', new Uint8Array([39, 16])],
  // appArgs: ['mint', '0x2710'], // same value as above 
  // appArgs: ['0x6d696e74', '0x2710'], // same value as above
  appAccounts: ['ZQHJE5D6E3NT775NKBSE6VLR6OT526F2SKOPQLHMZ2UCRUBVOEA3LIXIDM'],
}

async function getAppIds() {
  const algoTest = new ChainFactory().create(Models.ChainType.AlgorandV1, algoTestnetEndpoints) as ChainAlgorandV1
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }
  /** Compose and send transaction */
  const { applications } = await algoTest.algoClientIndexer.searchForApplications().do()
  console.log(applications)
  const appList = applications.map((app:any) => app?.params )

  const apps =  applications.filter((app: any) => app?.params?.creator === 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ')
  console.log(apps)
}

async function run() {
  /** Create Algorand chain instance */
  
  const algoTest = new ChainFactory().create(Models.ChainType.AlgorandV1, algoTestnetEndpoints) as ChainAlgorandV1
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }
  /** Compose and send transaction */
  const transaction = await algoTest.new.Transaction()

  // const { applications } = await algoTest.algoClientIndexer.searchForApplications().do()
  // console.log(applications)
  // const appList = applications.map((app:any) => app?.params )
  // const apps =  appList.filter((app: any) => app?.creator === 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ')
  // console.log(apps)

  const appApprovalSourceCode = await fs.readFileSync('../examples/application/approval_program.teal', 'utf8')
  const appClearSourceCode = await fs.readFileSync('../examples/application/clear_state_program.teal', 'utf8')
  // composeAppCreateParams.appApprovalProgram = appApprovalSourceCode
  // composeAppCreateParams.appClearProgram = appClearSourceCode
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppCreate, composeAppCreateParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppOptIn, composeAppOptInParams)
  // commented out by default because its repeatable.
  const action = await algoTest.composeAction(AlgorandChainActionType.AppNoOp, composeAppNoOpParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppCloseOut, composeAppCloseOutParams)
  // composeAppUpdateParams.appApprovalProgram = appApprovalSourceCode
  // composeAppUpdateParams.appClearProgram = appClearSourceCode
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppUpdate, composeAppUpdateParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppClear, composeAppClearParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AppDelete, composeAppDeleteParams)

  transaction.actions = [action]

  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  // const { sk } = algosdk.mnemonicToSecretKey(env.PRIVATE_SEED)
  // await transaction.sign([toAlgorandPrivateKey(sk)])
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  console.log('missing signatures: ', transaction.missingSignatures)
  console.log(transaction.rawTransaction)
  try {
    console.log('send response: %o', JSON.stringify(await transaction.send(Models.ConfirmType.After001)))
  } catch (err) {
    console.log(err)
  }
}

(async () => {
  try {
    await run()
    // await getAppIds()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
