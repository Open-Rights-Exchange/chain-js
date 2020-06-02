import {
  EthereumChainActionType,
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

const actionName = 'transfer'

interface tokenTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
}

// TODO: Call erc20 transfer compose action by default instead of recreating the values here
export const composeAction = ({ fromAccountName, toAccountName, tokenAmount, contractName }: tokenTransferParams) => ({
  from: fromAccountName,
  to: contractName,
  contract: {
    abi: erc20Abi,
    parameters: [toAccountName, tokenAmount],
    method: actionName,
  },
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract) {
    return {
      chainActionType: EthereumChainActionType.TokenTransfer,
      args: { ...action },
    }
  }

  return null
}
