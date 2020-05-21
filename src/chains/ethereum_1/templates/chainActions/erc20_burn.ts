// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumChainActionType,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

interface erc20BurnParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, value }: erc20BurnParams) => {
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

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'burn') {
    return {
      chainActionType: EthereumChainActionType.Erc20Burn,
      args: { ...action },
    }
  }

  return null
}
