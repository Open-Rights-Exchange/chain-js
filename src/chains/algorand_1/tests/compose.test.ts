// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { composeAction } from '../algoCompose'
// import { ChainActionType } from '../../../models'
import { composedAssetCreate } from './mockups/composedActions'
import { AlgorandChainActionType, AlgorandActionAssetCreateParams } from '../models'
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

    const chainState = await getChainState()
    const actAction = await composeAction(chainState, AlgorandChainActionType.AssetCreate, args)

    actAction.fee = 387000
    actAction.firstRound = 8322719
    actAction.lastRound = 8323719

    expect(JSON.stringify(actAction)).toEqual(composedAssetCreate)
  })
})
