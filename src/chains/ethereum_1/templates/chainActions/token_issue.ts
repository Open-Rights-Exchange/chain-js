import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as erc20Issue } from './erc20_issue'

interface tokenIssueParams {
  fromAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
}

// TODO: Call erc20 transfer compose action by default instead of recreating the values here
export const composeAction = ({ fromAccountName, tokenAmount, contractName }: tokenIssueParams) => ({
  ...erc20Issue({
    contractAddress: contractName,
    from: fromAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'issue') {
    return {
      chainActionType: ChainActionType.TokenIssue,
      args: { ...action },
    }
  }
  return null
}
