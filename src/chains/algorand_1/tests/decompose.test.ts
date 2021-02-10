// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { composeAction } from '../algoCompose'
import { decomposeAction } from '../algoDecompose'
import {
  AlgorandChainActionType,
  AlgorandActionAssetCreateParams,
  AlgorandActionAssetConfigParams,
  AlgorandActionAssetFreezeParams,
  AlgorandActionAssetTransferParams,
  AlgorandActionAssetDestroyParams,
  AlgorandKeyRegistrationParams,
  AlgorandActionPaymentParams,
  AlgorandActionAppMultiPurpose,
  AlgorandActionAppCreate,
  AlgorandActionAppUpdate,
} from '../models'
import { getChainState } from './mockups/chainState'
import {
  decomposedAppCreate,
  decomposedAppUpdate,
  decomposedAppOptIn,
  decomposedAppCloseOut,
  decomposedAppNoOp,
  decomposedAppClear,
  decomposedAppDelete,
  decomposedAssetCreate,
  decomposedAssetConfig,
  decomposedAssetFreeze,
  decomposedAssetTransfer,
  decomposedAssetDestroy,
  decomposedKeyRegistration,
  decomposedPayment,
} from './mockups/decomposedActions'
import { AlgorandChainState } from '../algoChainState'
import { sourceApproval, sourceClear } from './mockups/sourceCode'

// import { AlgorandChainState } from '../algoChainState'

describe('Decompose Algorand Chain Actions', () => {
  let chainState: AlgorandChainState
  it('decomposes asset create action object', async () => {
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
    const composedAction = await composeAction(chainState, AlgorandChainActionType.AssetCreate, args)

    const actAction = await decomposeAction(composedAction)

    expect(actAction).toEqual(decomposedAssetCreate)
  })

  it('decomposes asset config action object', async () => {
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
    const composedAction = await composeAction(chainState, AlgorandChainActionType.AssetConfig, args)

    const actAction = await decomposeAction(composedAction)

    expect(actAction).toEqual(decomposedAssetConfig)
  })

  it('decomposes asset freeze action object', async () => {
    const args: AlgorandActionAssetFreezeParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      freezeTarget: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      freezeState: true,
    }
    const composedAction = await composeAction(chainState, AlgorandChainActionType.AssetFreeze, args)

    const actAction = await decomposeAction(composedAction)

    expect(actAction).toEqual(decomposedAssetFreeze)
  })

  it('decomposes asset transfer action object', async () => {
    const args: AlgorandActionAssetTransferParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      closeRemainderTo: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetRevocationTarget: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      amount: 1000,
    }
    const composedAction = await composeAction(chainState, AlgorandChainActionType.AssetTransfer, args)

    const actAction = await decomposeAction(composedAction)

    expect(actAction).toEqual(decomposedAssetTransfer)
  })

  it('decomposes asset destroy action object', async () => {
    const args: AlgorandActionAssetDestroyParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
    }
    const composedAction = await composeAction(chainState, AlgorandChainActionType.AssetDestroy, args)

    const actAction = await decomposeAction(composedAction)

    expect(actAction).toEqual(decomposedAssetDestroy)
  })

  it('decomposes key registration action object', async () => {
    const args: AlgorandKeyRegistrationParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      voteKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      selectionKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      voteFirst: 10,
      voteLast: 100000,
      voteKeyDilution: 100,
    }
    const composedAction = await composeAction(chainState, AlgorandChainActionType.KeyRegistration, args)

    const actAction = await decomposeAction(composedAction)

    expect(actAction).toEqual(decomposedKeyRegistration)
  })

  it('decomposes payment action object', async () => {
    const args: AlgorandActionPaymentParams = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      closeRemainderTo: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      amount: 10,
    }
    const composedAction = await composeAction(chainState, AlgorandChainActionType.Payment, args)

    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedPayment[0])
  })

  it('creates app create action object', async () => {
    const args: Partial<AlgorandActionAppCreate> = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      appLocalInts: 0,
      appLocalByteSlices: 0,
      appGlobalInts: 1,
      appGlobalByteSlices: 0,
      appApprovalProgram: sourceApproval,
      appClearProgram: sourceClear,
    }

    const composedAction = await composeAction(chainState, AlgorandChainActionType.AppCreate, args)
    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedAppCreate[0])
  })

  it('creates app update action object', async () => {
    const args: Partial<AlgorandActionAppUpdate> = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      appIndex: 13379916,
      appApprovalProgram: sourceApproval,
      appClearProgram: sourceClear,
    }

    const composedAction = await composeAction(chainState, AlgorandChainActionType.AppUpdate, args)
    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedAppUpdate[0])
  })

  it('creates app optIn action object', async () => {
    const args: AlgorandActionAppMultiPurpose = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test optIn',
      appIndex: 13379916,
    }

    const composedAction = await composeAction(chainState, AlgorandChainActionType.AppOptIn, args)
    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedAppOptIn[0])
  })

  it('creates app close out action object', async () => {
    const args: AlgorandActionAppMultiPurpose = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test close out',
      appIndex: 13379916,
    }

    const composedAction = await composeAction(chainState, AlgorandChainActionType.AppCloseOut, args)
    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedAppCloseOut[0])
  })

  it('creates app noOp action object', async () => {
    const args: AlgorandActionAppMultiPurpose = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test noOp',
      appIndex: 13379916,
    }

    const composedAction = await composeAction(chainState, AlgorandChainActionType.AppNoOp, args)
    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedAppNoOp[0])
  })

  it('creates app clear action object', async () => {
    const args: AlgorandActionAppMultiPurpose = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test clear',
      appIndex: 13379916,
    }

    const composedAction = await composeAction(chainState, AlgorandChainActionType.AppClear, args)
    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedAppClear[0])
  })

  it('creates app delete action object', async () => {
    const args: AlgorandActionAppMultiPurpose = {
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test clear',
      appIndex: 13379916,
    }

    const composedAction = await composeAction(chainState, AlgorandChainActionType.AppDelete, args)
    const actAction = await decomposeAction(composedAction)

    expect(actAction[0]).toEqual(decomposedAppDelete[0])
  })
})
