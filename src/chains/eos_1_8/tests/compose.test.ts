// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { ChainActionType, composeAction } from '../eosCompose'

describe('Compose Chain Actions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('creates deleteAuth action object', async () => {
    const expAction = {
      account: 'eosio',
      name: 'deleteauth',
      authorization: [{ actor: 'authAccountName', permission: 'authPermission' }],
      data: { account: 'accountName', permission: 'permission' },
    }

    const args = {
      account: 'accountName',
      authAccountName: 'authAccountName',
      authPermission: 'authPermission',
      permission: 'permission',
    }
    const actAction = composeAction(ChainActionType.AccountDeleteAuth, args)
    expect(actAction).toEqual(expAction)
  })
})
