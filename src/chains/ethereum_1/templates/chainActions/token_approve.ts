import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import {
  composeAction as tokenApproveComposeAction,
  decomposeAction as tokenApproveDecomposeAction,
} from './erc20_approve'

interface tokenApproveParams {
  contractName: EthereumAddress
  fromAccountName: EthereumAddress
  toAccountName: EthereumAddress
  tokenAmount: number
}

// Calls ERC20Approve as default token template for Ethereum
export const composeAction = ({ fromAccountName, toAccountName, tokenAmount, contractName }: tokenApproveParams) => ({
  ...tokenApproveComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    spender: toAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  return {
    ...tokenApproveDecomposeAction(action),
    chainActionType: ChainActionType.TokenApprove,
  }
}
