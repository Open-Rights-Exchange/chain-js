// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumValue,
  EthereumTransactionAction,
  DecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

interface erc20TransferParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  to: EthereumAddress
  value: number
  data: EthereumValue[]
}

export const composeAction = ({ contractAddress, from, to, value, data }: erc20TransferParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [to, value, data],
    method: 'transferAndCall',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): DecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'transferAndCall') {
    return {
      chainActionType: EthereumChainActionType.Erc677TransferAndCall,
      args: { ...action },
    }
  }

  return null
}
