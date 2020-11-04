/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { ChainFactory, ChainType } from '../../../index'
import { ChainActionType, ChainEndpoint, TokenTransferParams } from '../../../models'
import {
  AlgorandActionAssetConfigParams,
  AlgorandChainActionType,
  AlgorandKeyRegistrationParams,
  AlgorandActionAssetCreateParams,
  AlgorandActionAssetDestroyParams,
  AlgorandActionAssetFreezeParams,
  AlgorandActionAssetTransferParams,
} from '../models'
import { toAlgorandPrivateKey, toAlgorandSymbol } from '../helpers'
import { toChainEntityName } from '../../../helpers'

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

const composeAssetConfigParams: AlgorandActionAssetConfigParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'config',
  assetIndex: 11158134,
  assetManager: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetReserve: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetFreeze: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetClawback: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  strictEmptyAddressChecking: false,
}

const composeAssetCreateParams: AlgorandActionAssetCreateParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'create',
  totalIssuance: 10000,
  assetDefaultFrozen: false,
  assetDecimals: 0,
  assetReserve: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetFreeze: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetClawback: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetManager: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetUnitName: 'exp',
  assetName: 'examplecoin',
  assetURL: '',
  assetMetadataHash: '',
}

const composeAssetDestroyParams: AlgorandActionAssetDestroyParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'destroy',
  assetIndex: 12739610,
}

const composeAssetFreezeParams: AlgorandActionAssetFreezeParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'freeze',
  assetIndex: 12739610,
  freezeTarget: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  freezeState: true,
}

const composeKeyRegistrationParams: AlgorandKeyRegistrationParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'note',
  voteKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  selectionKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  voteFirst: 6000000,
  voteLast: 9000000,
  voteKeyDilution: 1739,
}

const composeAssetTransferParams: AlgorandActionAssetTransferParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 5,
  note: 'example',
  assetIndex: 12739610,
}

// allow an account to accept an asset (0 value transfer to self)
const composeAcceptAssetParams: AlgorandActionAssetTransferParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 0,
  note: 'Allow Demo1',
  assetIndex: 12739610,
}

// use standard TokenTransfer action type
const composeTokenTransferParams: TokenTransferParams = {
  fromAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  toAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  amount: '0.002',
  memo: 'example',
  contractName: toChainEntityName('12739610'),
  symbol: toAlgorandSymbol('Demo1'),
  precision: 4,
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
  // const action = await algoTest.composeAction(AlgorandChainActionType.KeyRegistration, composeKeyRegistrationParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetCreate, composeAssetCreateParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetConfig, composeAssetConfigParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetDestroy, composeAssetDestroyParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetFreeze, composeAssetFreezeParams)
  const action = await algoTest.composeAction(AlgorandChainActionType.AssetTransfer, composeAssetTransferParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetTransfer, composeAcceptAssetParams)
  // const action = await algoTest.composeAction(ChainActionType.TokenTransfer, composeTokenTransferParams)

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
