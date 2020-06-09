// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { composeAction } from '../eosCompose'
import { ChainActionType } from '../../../models'
import {
  deleteAuth,
  createAccount,
  linkAuth,
  unlinkAuth,
  updateAuth,
  createEscrowCreate,
  createEscrowDefine,
  createEscrowInit,
  createEscrowReclaim,
  createEscrowTransfer,
  createEscrowWhitelist,
  eosTokenApprove,
  eosTokenCreate,
  eosTokenIssue,
  eosTokenRetire,
  eosTokenTransfer,
  eosTokenTransferFrom,
  oreCreateAccount,
  oreUpsertRight,
} from './mockups/composedActions'
import { EosChainActionType } from '../models'

describe('Compose Chain Actions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)

  it('creates createAccount action object', async () => {
    const args = {
      accountName: 'accountName',
      creatorAccountName: 'creatoracc',
      creatorPermission: 'active',
      publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      ramBytes: 3072,
      stakeNetQuantity: '1.0000 EOS',
      stakeCpuQuantity: '1.0000 EOS',
      transfer: false,
    }
    const actAction = composeAction(ChainActionType.AccountCreate, args)
    expect(actAction).toEqual(createAccount)
  })

  it('creates deleteAuth action object', async () => {
    const args = {
      account: 'accountName',
      authAccount: 'authAccount',
      authPermission: 'authPermission',
      permission: 'permission',
    }
    const actAction = composeAction(ChainActionType.AccountDeleteAuth, args)
    expect(actAction).toEqual(deleteAuth)
  })

  it('creates linkAuth action object', async () => {
    const args = {
      action: 'linkauth',
      authAccount: 'accountName',
      authPermission: 'active',
      contract: 'contract',
      permission: 'permission',
    }
    const actAction = composeAction(ChainActionType.AccountLinkAuth, args)
    expect(actAction).toEqual(linkAuth)
  })

  it('creates unlinkAuth action object', async () => {
    const args = {
      action: 'unlinkauth',
      authAccount: 'accountName',
      authPermission: 'active',
      contract: 'contract',
    }
    const actAction = composeAction(ChainActionType.AccountUnlinkAuth, args)
    expect(actAction).toEqual(unlinkAuth)
  })

  it('creates updateAuth action object', async () => {
    const args = {
      auth: 'auth',
      authAccount: 'accountName',
      authPermission: 'active',
      parent: 'parent',
      permission: 'permission',
    }
    const actAction = composeAction(ChainActionType.AccountUpdateAuth, args)
    expect(actAction).toEqual(updateAuth)
  })

  it('creates createEscrow create action object', async () => {
    const args = {
      accountName: 'accountName',
      contractName: 'createescrow',
      appName: 'app',
      creatorAccountName: 'creator',
      creatorPermission: 'active',
      publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      pricekey: '1',
      referralAccountName: 'referral',
    }
    const actAction = composeAction(EosChainActionType.CreateEscrowCreate, args)
    expect(actAction).toEqual(createEscrowCreate)
  })

  it('creates createEscrow define action object', async () => {
    const args = {
      accountName: 'accountName',
      airdrop: {
        contract: 'airdroper',
        tokens: '0.0000 AIR',
        limit: '0.0000 AIR',
      },
      appName: 'app',
      contractName: 'createescrow',
      cpu: '1.0000 EOS',
      permission: 'active',
      net: '1.0000 EOS',
      pricekey: '1',
      ram: '0',
      rex: {},
      useRex: false,
    }
    const actAction = composeAction(EosChainActionType.CreateEscrowDefine, args)
    expect(actAction).toEqual(createEscrowDefine)
  })

  it('creates createEscrow init action object', async () => {
    const args = {
      contractName: 'createescrow',
      chainSymbol: 'EOS,4',
      newAccountContract: 'eosio',
      newAccountAction: 'newaccount',
      minimumRAM: '0',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.CreateEscrowInit, args)
    expect(actAction).toEqual(createEscrowInit)
  })

  it('creates createEscrow reclaim action object', async () => {
    const args = {
      accountName: 'accountName',
      appName: 'app',
      contractName: 'createescrow',
      permission: 'active',
      symbol: 'EOS,4',
    }
    const actAction = composeAction(EosChainActionType.CreateEscrowReclaim, args)
    expect(actAction).toEqual(createEscrowReclaim)
  })

  it('creates createEscrow transfer action object', async () => {
    const args = {
      accountName: 'accountName',
      amount: '10.0000 EOS',
      contractName: 'createescrow',
      createEscrowAccountName: 'escrowname',
      memo: 'memo',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.CreateEscrowTransfer, args)
    expect(actAction).toEqual(createEscrowTransfer)
  })

  it('creates createEscrow whitelist action object', async () => {
    const args = {
      accountName: 'accountName',
      appName: 'app',
      contractName: 'createescrow',
      permission: 'active',
      whitelistAccount: 'whitelisted',
    }
    const actAction = composeAction(EosChainActionType.CreateEscrowWhitelist, args)
    expect(actAction).toEqual(createEscrowWhitelist)
  })

  it('creates eosToken approve action object', async () => {
    const args = {
      contractName: 'eosio.token',
      memo: 'memo',
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      amount: '5.0000',
      symbol: 'EOS',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.EosTokenApprove, args)
    expect(actAction).toEqual(eosTokenApprove)
  })

  it('creates eosToken create action object', async () => {
    const args = {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      toAccountName: 'eosio.token',
      amount: '10000.0000',
      symbol: 'EOS',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.EosTokenCreate, args)
    expect(actAction).toEqual(eosTokenCreate)
  })

  it('creates eosToken issue action object', async () => {
    const args = {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      toAccountName: 'eosio.token',
      amount: '1000.0000',
      symbol: 'EOS',
      memo: 'memoo',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.EosTokenIssue, args)
    expect(actAction).toEqual(eosTokenIssue)
  })

  it('creates eosToken retire action object', async () => {
    const args = {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      amount: '1000.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.EosTokenRetire, args)
    expect(actAction).toEqual(eosTokenRetire)
  })

  it('creates eosToken transfer action object', async () => {
    const args = {
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      contractName: 'eosio.token',
      amount: '100.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.EosTokenTransfer, args)
    expect(actAction).toEqual(eosTokenTransfer)
  })

  it('creates eosToken transferFrom action object', async () => {
    const args = {
      approvedAccountName: 'approved',
      contractName: 'eosio.token',
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      amount: '100.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    }
    const actAction = composeAction(EosChainActionType.EosTokenTransferFrom, args)
    expect(actAction).toEqual(eosTokenTransferFrom)
  })

  it('creates ore createAccout action object', async () => {
    const args = {
      accountName: 'accountName',
      creatorAccountName: 'creator',
      creatorPermission: 'active',
      publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      pricekey: '1',
      referralAccountName: 'referral',
    }
    const actAction = composeAction(EosChainActionType.OreCreateAccount, args)
    expect(actAction).toEqual(oreCreateAccount)
  })

  it('creates ore upsertRight action object', async () => {
    const args = {
      contractName: 'rights.ore',
      issuerWhitelist: '[accountName]',
      oreAccountName: 'accountName',
      rightName: 'test',
      urls: 'www.aikon.com',
    }
    const actAction = composeAction(EosChainActionType.OreUpsertRight, args)
    expect(actAction).toEqual(oreUpsertRight)
  })
})
