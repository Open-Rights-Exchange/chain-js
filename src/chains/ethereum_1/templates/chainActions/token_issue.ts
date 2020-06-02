import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as tokenIssueComposeAction, decomposeAction as tokenIssueDecomposeAction } from './erc20_issue'

interface TokenIssueParams {
  fromAccountName?: EthereumAddress
  amount?: number
  contractName?: EthereumAddress
}

// Calls ERC20Issue as default token template for Ethereum
export const composeAction = ({ fromAccountName, amount, contractName }: TokenIssueParams) => ({
  ...tokenIssueComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    value: amount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  if (tokenIssueDecomposeAction(action)) {
    return {
      ...tokenIssueDecomposeAction(action),
      chainActionType: ChainActionType.TokenIssue,
    }
  }
  return null
}
