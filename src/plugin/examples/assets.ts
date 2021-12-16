/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

// import { ChainFactory, ChainType } from '../../../index'
// import { ChainActionType, ChainEndpoint, TokenTransferParams, TxExecutionPriority } from '../../../models'
import { Models, ChainFactory, Helpers } from '@open-rights-exchange/chainjs'
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
// import { toChainEntityName } from '../../../helpers'



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
const composeTokenTransferParams: Models.TokenTransferParams = {
  fromAccountName: Helpers.toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  toAccountName: Helpers.toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
  amount: '0.002',
  memo: 'example',
  contractName: Helpers.toChainEntityName('12739610'),
  symbol: toAlgorandSymbol('Demo1'),
  precision: 4,
}

const testAppOptIn = {
  type: 'axfer',
  from: 'QLL4PEGFO7MGQJGUOPUT3MANOI2U3TG5YF3ZM66FPF4GMORTIKPHOYIGSI',
  to: 'QLL4PEGFO7MGQJGUOPUT3MANOI2U3TG5YF3ZM66FPF4GMORTIKPHOYIGSI',
  amount: 0,
  assetIndex: 14062899,
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(Models.ChainType.AlgorandV1, algoTestnetEndpoints)
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
  // const action = testAppOptIn

  transaction.actions = [action]
  // const suggestedFee = await transaction.getSuggestedFee(TxExecutionPriority.Average)
  // await transaction.setDesiredFee(suggestedFee)
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
