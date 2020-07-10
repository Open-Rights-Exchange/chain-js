// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import BN from 'bn.js'
import { decomposeAction } from '../ethDecompose'

import {
  composedERC20IssueAction,
  composedERC20ApproveAction,
  composedERC20BurnAction,
  composedERC20TransferAction,
  composedERC20TransferFromAction,
  composedERC721ApproveAction,
  composedERC721TransferAction,
  composedERC721TransferFromAction,
} from './mockups/composedActions'
import { EthereumTransactionAction } from '../models'
import { toEthereumTxData } from '../helpers'

describe('Decompose Chain Actions', () => {
  const composedEthTransferAction: EthereumTransactionAction = {
    to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
    from: '0x0000000000000000000000000000000000000000',
    value: '10',
    data: toEthereumTxData('0x00'),
  }

  it('decomposes eth transfer action object', async () => {
    const expAction = [
      {
        chainActionType: 'ValueTransfer',
        args: {
          toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
          fromAccountName: '0x0000000000000000000000000000000000000000',
          amount: '10',
          symbol: 'wei',
        },
      },
    ]
    const actAction = decomposeAction(composedEthTransferAction)

    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc20 approve action object', async () => {
    const expAction = [
      {
        chainActionType: 'TokenApprove',
        args: {
          contractName: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          fromAccountName: '0x0000000000000000000000000000000000000000',
          toAccountName: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          amount: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
      {
        chainActionType: 'ERC20Approve',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          spender: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          value: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
    ]

    const actAction = decomposeAction(composedERC20ApproveAction)
    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc20 burn action object', async () => {
    const expAction = [
      {
        chainActionType: 'ERC20Burn',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          value: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
    ]

    const actAction = decomposeAction(composedERC20BurnAction)
    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc20 issue action object', async () => {
    const expAction = [
      {
        chainActionType: 'ERC20Issue',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          value: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
    ]

    const actAction = decomposeAction(composedERC20IssueAction)
    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc20 transfer action object', async () => {
    const expAction = [
      {
        chainActionType: 'TokenTransfer',
        args: {
          contractName: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          fromAccountName: '0x0000000000000000000000000000000000000000',
          toAccountName: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          amount: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
      {
        chainActionType: 'ERC20Transfer',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          value: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
    ]

    const actAction = decomposeAction(composedERC20TransferAction)
    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc20 transferFrom action object', async () => {
    const expAction = [
      {
        chainActionType: 'TokenTransferFrom',
        args: {
          contractName: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          approvedAccountName: '0x0000000000000000000000000000000000000000',
          fromAccountName: '0x27105356f6c1ede0e92020e6225e46dc1f496b80',
          toAccountName: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          amount: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
      {
        chainActionType: 'ERC20TransferFrom',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          transferFrom: '0x27105356f6c1ede0e92020e6225e46dc1f496b80',
          to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          value: '20000000000000000000', // 20 with 18 decimals of precision
        },
      },
    ]

    const actAction = decomposeAction(composedERC20TransferFromAction)
    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc721 approve action object', async () => {
    const expAction = [
      {
        chainActionType: 'ERC721Approve',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          tokenId: 1,
        },
      },
    ]

    const actAction = decomposeAction(composedERC721ApproveAction)
    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc721 transfer action object', async () => {
    const expAction = [
      {
        chainActionType: 'ERC721Transfer',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          tokenId: 1,
        },
      },
    ]

    const actAction = decomposeAction(composedERC721TransferAction)
    expect(actAction).toEqual(expAction)
  })

  it('decomposes erc721 transferFrom action object', async () => {
    const expAction = [
      {
        chainActionType: 'ERC721TransferFrom',
        args: {
          contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          from: '0x0000000000000000000000000000000000000000',
          transferFrom: '0x27105356f6c1ede0e92020e6225e46dc1f496b80',
          to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
          tokenId: 1,
        },
      },
    ]

    const actAction = decomposeAction(composedERC721TransferFromAction)
    expect(actAction).toEqual(expAction)
  })
})
