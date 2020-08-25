// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { composeAction } from '../algoCompose'
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
} from '../models'
import { getChainState, algoTestnetEndpoints } from './mockups/chainState'

import AlgorandChainState from '../algoChainState'

const nativeInfo = {
  transactionHeaderParams: {
    fee: 0,
    genesisID: 'testnet-v1.0',
    genesishashb64: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    lastRound: 8815863,
    consensusVersion: 'https://github.com/algorandfoundation/specs/tree/e5f565421d720c6f75cdd186f7098495caf9101f',
    minFee: 1000,
  },
}

const mockGetChainInfo = jest.fn()

jest.mock('../algoChainState', () => ({
  getChainInfo: mockGetChainInfo,
}))

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
    const chainState = new AlgorandChainState(algoTestnetEndpoints)

    mockGetChainInfo.mockReturnValue(Promise.resolve({ nativeInfo }))

    console.log('CHAININFO: ', await chainState.getChainInfo())

    const actAction = await composeAction(chainState, AlgorandChainActionType.AssetCreate, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedAssetCreate)
  })

  it('creates asset config action object', async () => {
    const args: AlgorandActionAssetConfigParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      assetReserve: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetFreeze: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetClawback: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetManager: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      strictEmptyAddressChecking: false,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AssetConfig, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedAssetConfig)
  })

  it('creates asset freeze action object', async () => {
    const args: AlgorandActionAssetFreezeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      freezeTarget: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      freezeState: true,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AssetFreeze, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedAssetFreeze)
  })

  it('creates asset transfer action object', async () => {
    const args: AlgorandActionAssetTransferParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      closeRemainderTo: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetRevocationTarget: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      amount: 1000,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AssetTransfer, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedAssetTransfer)
  })

  it('creates asset destroy action object', async () => {
    const args: AlgorandActionAssetDestroyParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AssetDestroy, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedAssetDestroy)
  })

  it('creates key registration action object', async () => {
    const args: AlgorandKeyRegistrationParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      voteKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      selectionKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      voteFirst: 10,
      voteLast: 100000,
      voteKeyDilution: 100,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.KeyRegistration, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedKeyRegistration)
  })

  it('creates payment action object', async () => {
    const args: AlgorandActionPaymentParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      closeRemainderTo: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      amount: 10,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.Payment, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedPayment)
  })
})
