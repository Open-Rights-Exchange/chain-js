// import { toHex } from 'web3-utils'
import { EthereumAddress, EthereumTransactionAction, EthereumChainActionType, DecomposeReturn } from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

interface erc20TransferParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  to: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, to, value }: erc20TransferParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [to, value],
    method: 'transfer',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): DecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'transfer') {
    return {
      chainActionType: EthereumChainActionType.Erc20Transfer,
      args: { ...action },
    }
  }

  return null
}
