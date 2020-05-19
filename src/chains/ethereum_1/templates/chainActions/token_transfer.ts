import {
  EthereumChainActionType,
  EthereumAddress,
  EthereumTransactionAction,
  EthereumActionContract,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

const actionName = 'transfer'

interface tokenTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
  contract?: EthereumActionContract
}

export const composeAction = ({
  fromAccountName,
  toAccountName,
  tokenAmount,
  contractName,
  contract,
}: tokenTransferParams) => ({
  from: fromAccountName,
  to: contractName,
  contract: {
    abi: erc20Abi,
    parameters: [toAccountName, tokenAmount],
    method: actionName,
    ...contract,
  },
})

export const decomposeAction = (action: EthereumTransactionAction) => {
  const { to, from, contract } = action
  if (to && from && contract) {
    return {
      chainActionType: EthereumChainActionType.TokenTransfer,
      args: { ...action },
    }
  }

  return null
}
