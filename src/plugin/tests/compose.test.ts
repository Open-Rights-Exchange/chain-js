// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { composeAction } from '../algoCompose'
// import { ChainActionType } from '../../../models'
import {
  composedAppClear,
  composedAppCloseOut,
  composedAppCreate,
  composedAppDelete,
  composedAppNoOp,
  composedAppOptIn,
  composedAppUpdate,
  composedAssetConfig,
  composedAssetCreate,
  composedAssetDestroy,
  composedAssetFreeze,
  composedAssetTransfer,
  composedKeyRegistration,
  composedPayment,
} from './mockups/composedActions'
import { sourceApproval, sourceClear } from './mockups/sourceCode'
import {
  AlgorandActionAppCreateParams,
  AlgorandActionAppMultiPurposeParams,
  AlgorandActionAppUpdateParams,
  AlgorandActionAssetConfigParams,
  AlgorandActionAssetCreateParams,
  AlgorandActionAssetDestroyParams,
  AlgorandActionAssetFreezeParams,
  AlgorandActionAssetTransferParams,
  AlgorandActionPaymentParams,
  AlgorandChainActionType,
  AlgorandKeyRegistrationParams,
} from '../models'
import { getChainState } from './mockups/chainState'

import { AlgorandChainState } from '../algoChainState'

describe('Compose Algorand Chain Actions', () => {
  let chainState: AlgorandChainState
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
    chainState = await getChainState()
    const actAction = await composeAction(chainState, AlgorandChainActionType.AssetCreate, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAssetCreate))
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

    expect(actAction).toEqual(JSON.parse(composedAssetConfig))
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

    expect(actAction).toEqual(JSON.parse(composedAssetFreeze))
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

    expect(actAction).toEqual(JSON.parse(composedAssetTransfer))
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

    expect(actAction).toEqual(JSON.parse(composedAssetDestroy))
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

    expect(actAction).toEqual(JSON.parse(composedKeyRegistration))
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

    expect(actAction).toEqual(JSON.parse(composedPayment))
  })

  it('creates app create action object', async () => {
    const args: Partial<AlgorandActionAppCreateParams> = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      appLocalInts: 0,
      appLocalByteSlices: 0,
      appGlobalInts: 1,
      appGlobalByteSlices: 0,
      appApprovalProgram: sourceApproval,
      appClearProgram: sourceClear,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AppCreate, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppCreate))
  })

  it('creates app update action object', async () => {
    const args: Partial<AlgorandActionAppUpdateParams> = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      appIndex: 13379916,
      appApprovalProgram: sourceApproval,
      appClearProgram: sourceClear,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AppUpdate, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppUpdate))
  })

  it('creates app optIn action object', async () => {
    const args: AlgorandActionAppMultiPurposeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test optIn',
      appIndex: 13379916,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AppOptIn, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppOptIn))
  })

  it('creates app close out action object', async () => {
    const args: AlgorandActionAppMultiPurposeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test close out',
      appIndex: 13379916,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AppCloseOut, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppCloseOut))
  })

  it('creates app noOp base64 & UintArray appArgs action object', async () => {
    const args: AlgorandActionAppMultiPurposeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test noOp',
      appIndex: 13379916,
      appArgs: ['bWludA==', new Uint8Array([39, 16])],
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AppNoOp, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppNoOp))
  })

  it('creates app noOp hex appArgs action object', async () => {
    const args: AlgorandActionAppMultiPurposeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test noOp',
      appIndex: 13379916,
      appArgs: ['0x6d696e74', '0x2710'],
    }
    const actAction = await composeAction(chainState, AlgorandChainActionType.AppNoOp, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppNoOp))
  })

  it('creates app noOp readable appArgs action object', async () => {
    const args: AlgorandActionAppMultiPurposeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test noOp',
      appIndex: 13379916,
      appArgs: ['mint', 10000],
    }
    const actAction = await composeAction(chainState, AlgorandChainActionType.AppNoOp, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppNoOp))
  })

  it('creates app clear action object', async () => {
    const args: AlgorandActionAppMultiPurposeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test clear',
      appIndex: 13379916,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AppClear, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppClear))
  })

  it('creates app delete action object', async () => {
    const args: AlgorandActionAppMultiPurposeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test clear',
      appIndex: 13379916,
    }

    const actAction = await composeAction(chainState, AlgorandChainActionType.AppDelete, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(actAction).toEqual(JSON.parse(composedAppDelete))
  })
})
