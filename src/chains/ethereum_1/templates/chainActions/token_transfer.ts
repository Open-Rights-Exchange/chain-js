import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import {
  composeAction as tokenTransferComposeAction,
  decomposeAction as tokenTransferDecomposeAction,
} from './erc20_transfer'

interface TokenTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName?: EthereumAddress
  amount?: number
  contractName?: EthereumAddress
}

// Calls ERC20Transfer as default token template for Ethereum
export const composeAction = ({ fromAccountName, toAccountName, amount, contractName }: TokenTransferParams) => ({
  ...tokenTransferComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    to: toAccountName,
    value: amount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  if (tokenTransferDecomposeAction(action)) {
    return {
      ...tokenTransferDecomposeAction(action),
      chainActionType: ChainActionType.TokenTransfer,
    }
  }
  return null
}
