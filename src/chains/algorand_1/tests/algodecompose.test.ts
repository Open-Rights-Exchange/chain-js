// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { composeAction } from '../algoCompose'
import { decomposeAction } from '../algoDecompose'
// import { ChainActionType } from '../../../models'
import {
  composedAssetCreate,
  composedAssetConfig,
  composedAssetFreeze,
  composedAssetTransfer,
  composedAssetDestroy,
  composedKeyRegistration,
  composedPayment,
} from './mockups/composedActions'
import {
  AlgorandChainActionType,
  AlgorandActionAssetCreateParams,
  AlgorandActionAssetConfigParams,
  AlgorandActionAssetFreezeParams,
  AlgorandActionAssetTransferParams,
  AlgorandActionAssetDestroyParams,
  AlgorandKeyRegistrationParams,
  AlgorandActionPaymentParams,
  AlgorandTxAction,
  AlgorandTransactionTypeCode,
} from '../models'
import { getChainState } from './mockups/chainState'

// import { AlgorandChainState } from '../algoChainState'

describe('Compose Algorand Chain Actions', () => {
  it('creates asset create action object', async () => {
    const args: AlgorandActionAssetCreateParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
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

    const assetCreated = JSON.parse(composedAssetCreate)
    const iste = {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      fee: 387000,
      firstRound: 8431750,
      lastRound: 8432750,
      note: 'create',
      genesisID: 'testnet-v1.0',
      genesisHash: 'asd',
      assetDefaultFrozen: false,
      assetManager: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetReserve: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetFreeze: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetClawback: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetUnitName: 'exp',
      assetName: 'examplecoin',
      type: 'acfg',
    }

    const actAction = decomposeAction(assetCreated)

    // console.log(assetCreated)

    expect(JSON.stringify(actAction)).toEqual(composedAssetCreate)
  })
})
