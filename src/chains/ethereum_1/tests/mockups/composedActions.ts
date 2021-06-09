import { erc20Abi } from '../../templates/abis/erc20Abi'
import { erc721Abi } from '../../templates/abis/erc721Abi'
import { EthereumTransactionAction } from '../../models'
import { toEthereumAddress, toEthereumTxData } from '../../helpers'

export const composedERC20ApproveAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc20Abi,
    parameters: ['0x27105356f6c1ede0e92020e6225e46dc1f496b81', '20000000000000000000'], // 20 with 18 decimals of precision
    method: 'approve',
  },
}

export const composedERC20BurnAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc20Abi,
    parameters: ['20000000000000000000'], // 20 with 18 decimals of precision
    method: 'burn',
  },
}

export const composedERC20IssueAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc20Abi,
    parameters: ['20000000000000000000'], // 20 with 18 decimals of precision
    method: 'issue',
  },
}

export const composedERC20TransferAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc20Abi,
    parameters: ['0x27105356f6c1ede0e92020e6225e46dc1f496b81', '20000000000000000000'], // 20 with 18 decimals of precision
    method: 'transfer',
  },
}

export const composedERC20TransferFromAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc20Abi,
    parameters: [
      '0x27105356f6c1ede0e92020e6225e46dc1f496b80',
      '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
      '20000000000000000000', // 20 with 18 decimals of precision
    ],
    method: 'transferFrom',
  },
}

export const composedERC721ApproveAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc721Abi,
    parameters: ['0x27105356f6c1ede0e92020e6225e46dc1f496b81', 1],
    method: 'approve',
  },
}

export const composedERC721TransferAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc721Abi,
    parameters: ['0x27105356f6c1ede0e92020e6225e46dc1f496b81', 1],
    method: 'transfer',
  },
}

export const composedERC721TransferFromAction: EthereumTransactionAction = {
  to: toEthereumAddress('0x27105356f6c1ede0e92020e6225e46dc1f496b81'),
  from: toEthereumAddress('0x0000000000000000000000000000000000000000'),
  value: '0x00',
  data: toEthereumTxData('0xcc872b660000000000000000000000000000000000000000000000000000000000000014'),
  contract: {
    abi: erc721Abi,
    parameters: ['0x27105356f6c1ede0e92020e6225e46dc1f496b80', '0x27105356f6c1ede0e92020e6225e46dc1f496b81', 1],
    method: 'transferFrom',
  },
}
