// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import BN from 'bn.js'
import { composeAction } from '../ethCompose'
import { ChainActionType } from '../../../models'
import { erc20Abi } from '../templates/abis/erc20Abi'

describe('Compose Chain Actions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('creates eth transfer action object', async () => {
    const expAction = {
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      value: new BN(10),
    }

    const args = {
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      amount: 10,
    }
    const actAction = composeAction(ChainActionType.ValueTransfer, args)

    expect({ to: actAction.to, value: actAction.value }).toEqual(expAction)
  })

  it('creates erc20 transfer action object', async () => {
    const expAction = {
      to: '0x55555356F6C1ede0e92020e6225E46DC1F496b88',
      contract: {
        abi: erc20Abi,
        method: 'transfer',
        parameters: ['0x27105356F6C1ede0e92020e6225E46DC1F496b81', 15],
      },
    }

    const args = {
      contractName: '0x55555356F6C1ede0e92020e6225E46DC1F496b88',
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      amount: 15,
    }
    const actAction = composeAction(ChainActionType.TokenTransfer, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })
})
