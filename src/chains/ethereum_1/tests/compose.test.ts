// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import BN from 'bn.js'
import { composeAction } from '../ethCompose'
import { ChainActionType } from '../../../models'
import {
  composedERC20TransferAction,
  composedERC20ApproveAction,
  composedERC20BurnAction,
  composedERC20IssueAction,
  composedERC20TransferFromAction,
  composedERC721ApproveAction,
  composedERC721TransferAction,
  composedERC721TransferFromAction,
} from './mockups/composedActions'
import { EthereumChainActionType } from '../models'

describe('Compose Chain Actions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('creates eth transfer action object', async () => {
    const expAction = {
      to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      value: new BN(10, 10), // number 10 (in decimal)
    }

    const args = {
      toAccountName: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
      amount: '10',
    }
    const actAction = composeAction(ChainActionType.ValueTransfer, args)

    expect({ to: actAction.to, value: actAction.value }).toEqual(expAction)
  })

  it('creates erc20 approve action object', async () => {
    const { to, contract } = composedERC20ApproveAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      spender: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      precision: 18,
      value: '20',
    }
    const actAction = composeAction(EthereumChainActionType.ERC20Approve, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })

  it('creates erc20 burn action object', async () => {
    const { to, contract } = composedERC20BurnAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      precision: 18,
      value: '20',
    }
    const actAction = composeAction(EthereumChainActionType.ERC20Burn, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })

  it('creates erc20 issue action object', async () => {
    const { to, contract } = composedERC20IssueAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      precision: 18,
      value: '20',
    }
    const actAction = composeAction(EthereumChainActionType.ERC20Issue, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })

  it('creates erc20 transfer action object', async () => {
    const { to, contract } = composedERC20TransferAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      precision: 18,
      value: '20',
    }
    const actAction = composeAction(EthereumChainActionType.ERC20Transfer, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })

  it('creates erc20 transferFrom action object', async () => {
    const { to, contract } = composedERC20TransferFromAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      transferFrom: '0x27105356f6c1ede0e92020e6225e46dc1f496b80',
      to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      precision: 18,
      value: '20',
    }
    const actAction = composeAction(EthereumChainActionType.ERC20TransferFrom, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })

  it('creates erc721 approve action object', async () => {
    const { to, contract } = composedERC721ApproveAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      precision: 18,
      tokenId: 1,
    }
    const actAction = composeAction(EthereumChainActionType.ERC721Approve, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })

  it('creates erc721 transfer action object', async () => {
    const { to, contract } = composedERC721TransferAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      tokenId: 1,
    }
    const actAction = composeAction(EthereumChainActionType.ERC721Transfer, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })

  it('creates erc721 transferFrom action object', async () => {
    const { to, contract } = composedERC721TransferFromAction
    const expAction = { to, contract }

    const args = {
      contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      transferFrom: '0x27105356f6c1ede0e92020e6225e46dc1f496b80',
      to: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      tokenId: 1,
    }
    const actAction = composeAction(EthereumChainActionType.ERC721TransferFrom, args)
    expect({ to: actAction.to, contract: actAction.contract }).toEqual(expAction)
  })
})
