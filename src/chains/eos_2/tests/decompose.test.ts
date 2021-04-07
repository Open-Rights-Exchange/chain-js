import {
  composedNewAccount,
  composedDeleteAuth,
  composedLinkAuth,
  composedUnlinkAuth,
  composedUpdateAuth,
  composedCreateEscrowCreate,
  composedCreateEscrowDefine,
  composedCreateEscrowInit,
  composedCreateEscrowReclaim,
  composedCreateEscrowTransfer,
  composedCreateEscrowWhitelist,
  composedEosTokenApprove,
  composedEosTokenCreate,
  composedEosTokenIssue,
  composedEosTokenRetire,
  composedEosTokenTransfer,
  composedEosTokenTransferFrom,
  composedOreCreateAccount,
  composedOreUpsertRight,
} from './mockups/composedActions'
import { decomposeAction } from '../eosDecompose'

describe('Decompose Chain Actions', () => {
  it('decomposes account create action object', async () => {
    const expAction = [
      {
        chainActionType: 'AccountCreate',
        args: {
          accountName: 'accountname',
          creatorAccountName: 'creatoracc',
          creatorPermission: 'active',
          publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
          publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedNewAccount)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes account deleteAuth action object', async () => {
    const expAction = [
      {
        chainActionType: 'AccountDeleteAuth',
        args: {
          account: 'accountname',
          authAccount: 'authaccount',
          authPermission: 'active',
          permission: 'permission',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedDeleteAuth)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes account linkAuth action object', async () => {
    const expAction = [
      {
        chainActionType: 'AccountLinkAuth',
        args: {
          action: 'linkauth',
          authAccount: 'accountname',
          authPermission: 'active',
          contract: 'contract',
          permission: 'permission',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedLinkAuth)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes account unlinkAuth action object', async () => {
    const expAction = [
      {
        chainActionType: 'AccountUnlinkAuth',
        args: {
          action: 'unlinkauth',
          authAccount: 'accountname',
          authPermission: 'active',
          contract: 'contract',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedUnlinkAuth)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes account updateAuth action object', async () => {
    const expAction = [
      {
        chainActionType: 'AccountUpdateAuth',
        args: {
          auth: {
            threshold: 1,
            accounts: [
              {
                permission: {
                  actor: 'accountname',
                  permission: 'owner',
                },
                weight: 1,
              },
            ],
            keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
            waits: [
              {
                wait_sec: 1,
                weight: 1,
              },
            ],
          },
          authAccount: 'accountname',
          authPermission: 'active',
          parent: 'parent',
          permission: 'active',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedUpdateAuth)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes createEscrow create action object', async () => {
    const expAction = [
      {
        chainActionType: 'CreateEscrowCreate',
        args: {
          accountName: 'accountname',
          contractName: 'createescrow',
          appName: 'app',
          creatorAccountName: 'creator',
          creatorPermission: 'active',
          publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
          publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
          // pricekey: '1',
          pricekey: null as number,
          referralAccountName: 'referral',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedCreateEscrowCreate)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes createEscrow define action object', async () => {
    const expAction = [
      {
        chainActionType: 'CreateEscrowDefine',
        args: {
          accountName: 'accountname',
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
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedCreateEscrowDefine)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes createEscrow init action object', async () => {
    const expAction = [
      {
        chainActionType: 'CreateEscrowInit',
        args: {
          contractName: 'createescrow',
          chainSymbol: 'EOS,4',
          newAccountContract: 'eosio',
          newAccountAction: 'newaccount',
          minimumRAM: '0',
          permission: 'active',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedCreateEscrowInit)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes createEscrow reclaim action object', async () => {
    const expAction = [
      {
        chainActionType: 'CreateEscrowReclaim',
        args: {
          accountName: 'accountname',
          appName: 'app',
          contractName: 'createescrow',
          permission: 'active',
          symbol: 'EOS,4',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedCreateEscrowReclaim)

    expect(actAction).toEqual(expAction)
  })

  // Returns all transfer decompose results. Needs differentiator
  // decomposeAction returns more than one result (because pattern matches token and value transfer as well as escrow transfer)
  it('decomposes createEscrow transfer action object', async () => {
    const expAction = {
      chainActionType: 'CreateEscrowTransfer',
      args: {
        accountName: 'accountname',
        amount: '10.0000 EOS',
        contractName: 'createescrow',
        createEscrowAccountName: 'escrowname',
        memo: 'memo',
        permission: 'active',
      },
      partial: false,
    }
    const actActions = await decomposeAction(composedCreateEscrowTransfer)
    expect(actActions).toContainEqual(expAction)
  })

  it('decomposes createEscroe whitelist action object', async () => {
    const expAction = [
      {
        chainActionType: 'CreateEscrowWhitelist',
        args: {
          accountName: 'accountname',
          appName: 'app',
          contractName: 'createescrow',
          permission: 'active',
          whitelistAccount: 'whitelisted',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedCreateEscrowWhitelist)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes eosToken approve action object', async () => {
    const expAction = {
      chainActionType: 'EosTokenApprove',
      args: {
        contractName: 'eosio.token',
        memo: 'memo',
        fromAccountName: 'fromaccount',
        toAccountName: 'toaccount',
        amount: '5.0000',
        symbol: 'EOS',
        permission: 'active',
      },
      partial: false,
    }
    const actAction = await decomposeAction(composedEosTokenApprove)

    expect(actAction).toContainEqual(expAction)
  })

  it('decomposes eosToken create action object', async () => {
    const expAction = [
      {
        chainActionType: 'EosTokenCreate',
        args: {
          contractName: 'eosio.token',
          ownerAccountName: 'eosio',
          toAccountName: 'eosio.token',
          amount: '10000.0000',
          symbol: 'EOS',
          permission: 'active',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedEosTokenCreate)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes eosToken issue action object', async () => {
    const expAction = [
      {
        chainActionType: 'EosTokenIssue',
        args: {
          contractName: 'eosio.token',
          ownerAccountName: 'eosio',
          toAccountName: 'eosio.token',
          amount: '1000.0000',
          symbol: 'EOS',
          memo: 'memoo',
          permission: 'active',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedEosTokenIssue)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes eosToken retire action object', async () => {
    const expAction = [
      {
        chainActionType: 'EosTokenRetire',
        args: {
          contractName: 'eosio.token',
          ownerAccountName: 'eosio',
          amount: '1000.0000',
          symbol: 'EOS',
          memo: 'memo',
          permission: 'active',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedEosTokenRetire)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes eosToken transfer action object', async () => {
    const expAction = {
      chainActionType: 'EosTokenTransfer',
      args: {
        fromAccountName: 'fromaccount',
        toAccountName: 'toaccount',
        contractName: 'eosio.token',
        amount: '100.0000',
        symbol: 'EOS',
        memo: 'memo',
        permission: 'active',
      },
      partial: false,
    }
    const actAction = await decomposeAction(composedEosTokenTransfer)

    expect(actAction).toContainEqual(expAction)
  })

  it('decomposes eosToken transferFrom action object', async () => {
    const expAction = [
      {
        chainActionType: 'TokenTransferFrom',
        args: {
          approvedAccountName: 'approved',
          contractName: 'eosio.token',
          fromAccountName: 'fromaccount',
          toAccountName: 'toaccount',
          amount: '100.0000',
          symbol: 'EOS',
          memo: 'memo',
          permission: 'active',
        },
        partial: false,
      },
      {
        chainActionType: 'EosTokenTransferFrom',
        args: {
          approvedAccountName: 'approved',
          contractName: 'eosio.token',
          fromAccountName: 'fromaccount',
          toAccountName: 'toaccount',
          amount: '100.0000',
          symbol: 'EOS',
          memo: 'memo',
          permission: 'active',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedEosTokenTransferFrom)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes ore createAccount action object', async () => {
    const expAction = [
      {
        chainActionType: 'OreCreateAccount',
        args: {
          accountName: 'accountname',
          creatorAccountName: 'creator',
          creatorPermission: 'active',
          publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
          publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
          tier: '1',
          referralAccountName: 'referral',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedOreCreateAccount)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes ore upsertRight action object', async () => {
    const expAction = [
      {
        chainActionType: 'OreUpsertRight',
        args: {
          contractName: 'rights.ore',
          issuerWhitelist: ['accountname'],
          oreAccountName: 'accountname',
          rightName: 'test',
          urls: 'www.aikon.com',
        },
        partial: false,
      },
    ]
    const actAction = await decomposeAction(composedOreUpsertRight)

    expect(actAction).toEqual(expAction)
  })
})
