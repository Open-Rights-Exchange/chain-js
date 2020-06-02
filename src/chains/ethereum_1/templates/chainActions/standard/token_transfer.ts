import { ChainActionType, TokenTransferParams } from '../../../../../models'
import { EthereumTransactionAction, EthereumDecomposeReturn } from '../../../models'
import {
  composeAction as erc20TokenTransferComposeAction,
  decomposeAction as erc20TokenTransferDecomposeAction,
} from '../chainSpecific/erc20_transfer'

// Calls ERC20Transfer as default token template for Ethereum
export const composeAction = ({ fromAccountName, toAccountName, amount, contractName }: TokenTransferParams) => ({
  ...erc20TokenTransferComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    to: toAccountName,
    value: amount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const decomposed = erc20TokenTransferDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.TokenTransfer,
    }
  }
  return null
}
