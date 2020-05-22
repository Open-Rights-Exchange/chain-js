import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as tokenIssueComposeAction, decomposeAction as tokenIssueDecomposeAction } from './erc20_issue'

interface tokenIssueParams {
  fromAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
}

// Calls ERC20Issue as default token template for Ethereum
export const composeAction = ({ fromAccountName, tokenAmount, contractName }: tokenIssueParams) => ({
  ...tokenIssueComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  return {
    ...tokenIssueDecomposeAction(action),
    chainActionType: ChainActionType.TokenIssue,
  }
}
