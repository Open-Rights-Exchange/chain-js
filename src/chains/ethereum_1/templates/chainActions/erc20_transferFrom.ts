// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

interface erc20TransferFromParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  transferFrom: EthereumAddress
  to: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, transferFrom, to, value }: erc20TransferFromParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [transferFrom, to, value],
    method: 'transferFrom',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'transferFrom') {
    return {
      chainActionType: EthereumChainActionType.Erc20TransferFrom,
      args: { ...action },
    }
  }

  return null
}
