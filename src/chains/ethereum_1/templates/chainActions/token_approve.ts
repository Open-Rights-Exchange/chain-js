import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import {
  composeAction as tokenApproveComposeAction,
  decomposeAction as tokenApproveDecomposeAction,
} from './erc20_approve'

interface TokenApproveParams {
  contractName: EthereumAddress
  fromAccountName: EthereumAddress
  toAccountName: EthereumAddress
  amount: number
}

// Calls ERC20Approve as default token template for Ethereum
export const composeAction = ({ fromAccountName, toAccountName, amount, contractName }: TokenApproveParams) => ({
  ...tokenApproveComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    spender: toAccountName,
    value: amount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  if (tokenApproveDecomposeAction(action)) {
    return {
      ...tokenApproveDecomposeAction(action),
      chainActionType: ChainActionType.TokenApprove,
    }
  }
  return null
}
