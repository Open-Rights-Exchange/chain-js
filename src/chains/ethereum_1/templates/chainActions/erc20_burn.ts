// import { toHex } from 'web3-utils'
import { EthereumAddress, EthereumChainActionType, DecomposeReturn, EthereumTransactionAction } from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

interface erc20IssueParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, value }: erc20IssueParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [value],
    method: 'burn',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): DecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'burn') {
    return {
      chainActionType: EthereumChainActionType.Erc20Burn,
      args: { ...action },
    }
  }

  return null
}
