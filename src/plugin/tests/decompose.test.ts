// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { decomposeAction } from '../algoDecompose'
import {
  decomposedAppClear,
  decomposedAppCloseOut,
  decomposedAppCreate,
  decomposedAppDelete,
  decomposedAppNoOp,
  decomposedAppOptIn,
  decomposedAppUpdate,
  decomposedAssetCreate,
  decomposedAssetConfig,
  decomposedAssetDestroy,
  decomposedAssetFreeze,
  decomposedAssetTransfer,
  decomposedKeyRegistration,
  decomposedPayment,
} from './mockups/decomposedActions'
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

describe('Decompose Algorand Chain Actions', () => {
  it('decomposes asset create action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAssetCreate))
    expect(actAction).toEqual(decomposedAssetCreate)
  })

  it('decomposes asset config action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAssetConfig))
    expect(actAction).toEqual(decomposedAssetConfig)
  })

  it('decomposes asset freeze action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAssetFreeze))
    expect(actAction).toEqual(decomposedAssetFreeze)
  })

  it('decomposes asset transfer action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAssetTransfer))
    expect(actAction).toEqual(decomposedAssetTransfer)
  })

  it('decomposes asset destroy action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAssetDestroy))
    expect(actAction).toEqual(decomposedAssetDestroy)
  })

  it('decomposes key registration action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedKeyRegistration))
    expect(actAction).toEqual(decomposedKeyRegistration)
  })

  it('decomposes payment action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedPayment))
    expect(actAction).toEqual(decomposedPayment)
  })

  // Special case with appCreate, if appIndex == 0 that means it is appCreate and appOnComplete can be any valid integer.
  it('creates app create action object', async () => {
    const appCreateArgs = JSON.parse(composedAppCreate)
    let actAction = await decomposeAction(appCreateArgs)
    expect(actAction).toEqual(decomposedAppCreate)

    actAction = await decomposeAction({ ...appCreateArgs, appOnComplete: 1 })
    const decomposedAppOnCompleteAltered = decomposedAppCreate[0]
    decomposedAppOnCompleteAltered.args.appOnComplete = 1
    expect(actAction).toEqual([decomposedAppOnCompleteAltered])

    actAction = await decomposeAction({ ...appCreateArgs, appOnComplete: 2 })
    decomposedAppOnCompleteAltered.args.appOnComplete = 2
    expect(actAction).toEqual([decomposedAppOnCompleteAltered])

    actAction = await decomposeAction({ ...appCreateArgs, appOnComplete: 3 })
    decomposedAppOnCompleteAltered.args.appOnComplete = 3
    expect(actAction).toEqual([decomposedAppOnCompleteAltered])

    actAction = await decomposeAction({ ...appCreateArgs, appOnComplete: 4 })
    decomposedAppOnCompleteAltered.args.appOnComplete = 4
    expect(actAction).toEqual([decomposedAppOnCompleteAltered])
  })

  it('creates app update action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAppUpdate))
    expect(actAction).toEqual(decomposedAppUpdate)
  })

  it('creates app optIn action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAppOptIn))
    expect(actAction).toEqual(decomposedAppOptIn)
  })

  it('creates app close out action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAppCloseOut))
    expect(actAction).toEqual(decomposedAppCloseOut)
  })

  it('creates app noOp action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAppNoOp))
    expect(actAction).toEqual(decomposedAppNoOp)
  })

  it('creates app clear action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAppClear))
    expect(actAction).toEqual(decomposedAppClear)
  })

  it('creates app delete action object', async () => {
    const actAction = await decomposeAction(JSON.parse(composedAppDelete))
    expect(actAction).toEqual(decomposedAppDelete)
  })
})
