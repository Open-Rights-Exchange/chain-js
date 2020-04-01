// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { composeAction } from '../ethCompose'
import { ChainActionType } from '../../../models'
import { toWei } from '../helpers'

describe('Compose Chain Actions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('creates eth transfer action object', async () => {
    const expAction = {
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      value: toWei(10, 'milliether'),
      data: '0x00',
    }

    const args = {
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      value: 10,
    }
    const actAction = composeAction(ChainActionType.TokenTransfer, args)
    console.log(actAction)
    expect(actAction).toEqual(expAction)
  })

  it('creates erc20 transfer action object', async () => {
    const expAction = {
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      value: toWei(10, 'milliether'),
      data: '0x00',
    }

    const args = {
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      value: 10,
    }
    const actAction = composeAction(ChainActionType.TokenTransfer, args)
    console.log(actAction)
    expect(actAction).toEqual(expAction)
  })
})
