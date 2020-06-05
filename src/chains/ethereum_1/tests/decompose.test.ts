// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import BN from 'bn.js'
import { decomposeAction } from '../ethDecompose'
import { erc20Abi } from '../templates/abis/erc20Abi'
import { EthereumTransactionAction } from '../models'
import { toEthereumTxData } from '../helpers'

describe('Decompose Chain Actions', () => {
  const composedERC20IssueAction: EthereumTransactionAction = {
    to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
    from: '0x0000000000000000000000000000000000000000',
    value: '0x00',
    data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
    contract: {
      abi: erc20Abi,
      parameters: [20],
      method: 'issue',
    },
  }

  const composedEthTransferAction: EthereumTransactionAction = {
    to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
    from: '0x0000000000000000000000000000000000000000',
    value: new BN(10),
    data: toEthereumTxData('0x00'),
  }

  it('decomposes eth transfer action object', async () => {
    const expAction = [
      {
        chainActionType: 'ValueTransfer',
        args: {
          toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
          fromAccountName: '0x0000000000000000000000000000000000000000',
          amount: new BN(10),
          symbol: 'wei',
        },
      },
    ]
    const actAction = decomposeAction(composedEthTransferAction)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc20 issue action object', async () => {
    const expAction = [
      {
        chainActionType: 'ERC20Issue',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          value: 20,
        },
      },
    ]

    const actAction = decomposeAction(composedERC20IssueAction)
    expect(actAction).toEqual(expAction)
  })
})
