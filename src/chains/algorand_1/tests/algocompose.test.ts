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

  // it('creates asset config action object', async () => {
  //   const args = {
  //     account: 'accountname',
  //     authAccount: 'authaccount',
  //     authPermission: 'active',
  //     permission: 'permission',
  //   }
  //   const actAction = composeAction(ChainActionType.AccountDeleteAuth, args)
  //   expect(actAction).toEqual(composedDeleteAuth)
  // })

  // it('creates asset destroy action object', async () => {
  //   const args = {
  //     action: 'linkauth',
  //     authAccount: 'accountname',
  //     authPermission: 'active',
  //     contract: 'contract',
  //     permission: 'permission',
  //   }
  //   const actAction = composeAction(ChainActionType.AccountLinkAuth, args)
  //   expect(actAction).toEqual(composedLinkAuth)
  // })

  // it('creates asset freeze action object', async () => {
  //   const args = {
  //     action: 'unlinkauth',
  //     authAccount: 'accountname',
  //     authPermission: 'active',
  //     contract: 'contract',
  //   }
  //   const actAction = composeAction(ChainActionType.AccountUnlinkAuth, args)
  //   expect(actAction).toEqual(composedUnlinkAuth)
  // })

  // it('creates asset transfer action object', async () => {
  //   const args = {
  //     auth: {
  //       threshold: 1,
  //       accounts: [
  //         {
  //           permission: {
  //             actor: 'accountname',
  //             permission: 'owner',
  //           },
  //           weight: 1,
  //         },
  //       ],
  //       keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
  //       waits: [
  //         {
  //           wait_sec: 1,
  //           weight: 1,
  //         },
  //       ],
  //     },
  //     authAccount: 'accountname',
  //     authPermission: 'active',
  //     parent: 'parent',
  //     permission: 'permission',
  //   }
  //   const actAction = composeAction(ChainActionType.AccountUpdateAuth, args)
  //   expect(actAction).toEqual(composedUpdateAuth)
  // })

  // it('creates createEscrow create action object', async () => {
  //   const args = {
  //     accountName: 'accountname',
  //     contractName: 'createescrow',
  //     appName: 'app',
  //     creatorAccountName: 'creator',
  //     creatorPermission: 'active',
  //     publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  //     publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  //     pricekey: '1',
  //     referralAccountName: 'referral',
  //   }
  //   const actAction = composeAction(EosChainActionType.CreateEscrowCreate, args)
  //   expect(actAction).toEqual(composedCreateEscrowCreate)
  // })

  // it('creates createEscrow define action object', async () => {
  //   const args = {
  //     accountName: 'accountname',
  //     airdrop: {
  //       contract: 'airdroper',
  //       tokens: '0.0000 AIR',
  //       limit: '0.0000 AIR',
  //     },
  //     appName: 'app',
  //     contractName: 'createescrow',
  //     cpu: '1.0000 EOS',
  //     permission: 'active',
  //     net: '1.0000 EOS',
  //     pricekey: '1',
  //     ram: '0',
  //     rex: {},
  //     useRex: false,
  //   }
  //   const actAction = composeAction(EosChainActionType.CreateEscrowDefine, args)
  //   expect(actAction).toEqual(composedCreateEscrowDefine)
  // })

  // it('creates createEscrow init action object', async () => {
  //   const args = {
  //     contractName: 'createescrow',
  //     chainSymbol: 'EOS,4',
  //     newAccountContract: 'eosio',
  //     newAccountAction: 'newaccount',
  //     minimumRAM: '0',
  //     permission: 'active',
  //   }
  //   const actAction = composeAction(EosChainActionType.CreateEscrowInit, args)
  //   expect(actAction).toEqual(composedCreateEscrowInit)
  // })

  // it('creates createEscrow reclaim action object', async () => {
  //   const args = {
  //     accountName: 'accountname',
  //     appName: 'app',
  //     contractName: 'createescrow',
  //     permission: 'active',
  //     symbol: 'EOS,4',
  //   }
  //   const actAction = composeAction(EosChainActionType.CreateEscrowReclaim, args)
  //   expect(actAction).toEqual(composedCreateEscrowReclaim)
  // })

  // it('creates createEscrow transfer action object', async () => {
  //   const args = {
  //     accountName: 'accountname',
  //     amount: '10.0000 EOS',
  //     contractName: 'createescrow',
  //     createEscrowAccountName: 'escrowname',
  //     memo: 'memo',
  //     permission: 'active',
  //   }
  //   const actActions = composeAction(EosChainActionType.CreateEscrowTransfer, args)
  //   expect(actActions).toEqual(composedCreateEscrowTransfer)
  // })

  // it('creates createEscrow whitelist action object', async () => {
  //   const args = {
  //     accountName: 'accountname',
  //     appName: 'app',
  //     contractName: 'createescrow',
  //     permission: 'active',
  //     whitelistAccount: 'whitelisted',
  //   }
  //   const actAction = composeAction(EosChainActionType.CreateEscrowWhitelist, args)
  //   expect(actAction).toEqual(composedCreateEscrowWhitelist)
  // })

  // it('creates eosToken approve action object', async () => {
  //   const args = {
  //     contractName: 'eosio.token',
  //     memo: 'memo',
  //     fromAccountName: 'fromaccount',
  //     toAccountName: 'toaccount',
  //     amount: '5.0000',
  //     symbol: 'EOS',
  //     permission: 'active',
  //   }
  //   const actAction = composeAction(EosChainActionType.EosTokenApprove, args)
  //   expect(actAction).toEqual(composedEosTokenApprove)
  // })

  // it('creates eosToken create action object', async () => {
  //   const args = {
  //     contractName: 'eosio.token',
  //     ownerAccountName: 'eosio',
  //     toAccountName: 'eosio.token',
  //     amount: '10000.0000',
  //     symbol: 'EOS',
  //     permission: 'active',
  //   }
  //   const actAction = composeAction(EosChainActionType.EosTokenCreate, args)
  //   expect(actAction).toEqual(composedEosTokenCreate)
  // })

  // it('creates eosToken issue action object', async () => {
  //   const args = {
  //     contractName: 'eosio.token',
  //     ownerAccountName: 'eosio',
  //     toAccountName: 'eosio.token',
  //     amount: '1000.0000',
  //     symbol: 'EOS',
  //     memo: 'memoo',
  //     permission: 'active',
  //   }
  //   const actAction = composeAction(EosChainActionType.EosTokenIssue, args)
  //   expect(actAction).toEqual(composedEosTokenIssue)
  // })

  // it('creates eosToken retire action object', async () => {
  //   const args = {
  //     contractName: 'eosio.token',
  //     ownerAccountName: 'eosio',
  //     amount: '1000.0000',
  //     symbol: 'EOS',
  //     memo: 'memo',
  //     permission: 'active',
  //   }
  //   const actAction = composeAction(EosChainActionType.EosTokenRetire, args)
  //   expect(actAction).toEqual(composedEosTokenRetire)
  // })

  // it('creates eosToken transfer action object', async () => {
  //   const args = {
  //     fromAccountName: 'fromaccount',
  //     toAccountName: 'toaccount',
  //     contractName: 'eosio.token',
  //     amount: '100.0000',
  //     symbol: 'EOS',
  //     memo: 'memo',
  //     permission: 'active',
  //   }
  //   const actAction = composeAction(EosChainActionType.EosTokenTransfer, args)
  //   expect(actAction).toEqual(composedEosTokenTransfer)
  // })

  // it('creates eosToken transferFrom action object', async () => {
  //   const args = {
  //     approvedAccountName: 'approved',
  //     contractName: 'eosio.token',
  //     fromAccountName: 'fromaccount',
  //     toAccountName: 'toaccount',
  //     amount: '100.0000',
  //     symbol: 'EOS',
  //     memo: 'memo',
  //     permission: 'active',
  //   }
  //   const actAction = composeAction(EosChainActionType.EosTokenTransferFrom, args)
  //   expect(actAction).toEqual(composedEosTokenTransferFrom)
  // })

  // it('creates ore createAccout action object', async () => {
  //   const args = {
  //     accountName: 'accountname',
  //     creatorAccountName: 'creator',
  //     creatorPermission: 'active',
  //     publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  //     publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  //     pricekey: '1',
  //     referralAccountName: 'referral',
  //   }
  //   const actAction = composeAction(EosChainActionType.OreCreateAccount, args)
  //   expect(actAction).toEqual(composedOreCreateAccount)
  // })

  // it('creates ore upsertRight action object', async () => {
  //   const args = {
  //     contractName: 'rights.ore',
  //     issuerWhitelist: ['accountname'],
  //     oreAccountName: 'accountname',
  //     rightName: 'test',
  //     urls: 'www.aikon.com',
  //   }
  //   const actAction = composeAction(EosChainActionType.OreUpsertRight, args)
  //   expect(actAction).toEqual(composedOreUpsertRight)
  // })
})
