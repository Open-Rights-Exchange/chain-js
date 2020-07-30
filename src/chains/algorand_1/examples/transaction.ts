/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint, ChainActionType } from '../../../models'
import {
  AlgorandAddress,
  AlgorandPrivateKey,
  AlgorandUnit,
  AlgorandValue,
  AlgorandActionAssetConfigParams,
  AlgorandChainActionType,
  AlgorandKeyRegistrationParams,
  AlgorandActionAssetCreateParams,
  AlgorandActionAssetDestroyParams,
  AlgorandActionAssetFreezeParams,
  AlgorandActionAssetTransferParams,
} from '../models'
import { toAlgorandPrivateKey } from '../helpers'

require('dotenv').config()

const { env } = process

const algoPureStakeTestnet = 'https://testnet-algorand.api.purestake.io/ps1'

export const algoTestnetEndpoints: ChainEndpoint[] = [
  {
    url: new URL(algoPureStakeTestnet),
    options: {
      headers: [
        {
          'X-API-Key': '7n0G2itKl885HQQzEfwtn4SSE1b6X3nb6zVnUw99',
        },
      ],
    },
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
  toAccountName: 'GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A',
  amount: 1000000,
  symbol: AlgorandUnit.Microalgo,
  memo: 'Hello World',
}

const composeAssetConfigParams: AlgorandActionAssetConfigParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'config',
  assetIndex: 11137706,
  assetManager: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetReserve: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetFreeze: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  assetClawback: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  strictEmptyAddressChecking: false,
}

const composeAssetCreateParams: AlgorandActionAssetCreateParams = {
  fromAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'create',
  totalIssuance: 1000,
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
  assetIndex: 11137706,
}

const composeAssetFreezeParams: AlgorandActionAssetFreezeParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  note: 'freeze',
  assetIndex: 11137706,
  freezeTarget: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  freezeState: true,
}

const composeAssetTransferParams: AlgorandActionAssetTransferParams = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 5,
  note: 'example',
  assetIndex: 11137706,
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
;(async () => {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoPureStakeTestnet)
  }

  /** Compose and send transaction V */
  const transaction = await algoTest.new.Transaction()
  composeValueTransferParams.fromAccountName = 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'
  const action = await algoTest.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetCreate, composeAssetCreateParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetConfig, composeAssetConfigParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetDestroy, composeAssetDestroyParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetFreeze, composeAssetFreezeParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.AssetTransfer, composeAssetTransferParams)
  // const action = await algoTest.composeAction(AlgorandChainActionType.KeyRegistration, composeKeyRegistrationParams)
  transaction.actions = [action]
  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  console.log('missing signatures: ', transaction.missingSignatures)
  try {
    console.log('send response: %o', JSON.stringify(await transaction.send()))
  } catch (err) {
    console.log(err)
  }
})()
