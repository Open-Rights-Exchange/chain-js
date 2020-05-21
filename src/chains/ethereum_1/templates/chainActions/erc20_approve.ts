// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

interface erc20ApproveParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  spender: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, spender, value }: erc20ApproveParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [spender, value],
    method: 'approve',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'approve') {
    return {
      chainActionType: EthereumChainActionType.Erc20Approve,
      args: { ...action },
    }
  }

  return null
}
