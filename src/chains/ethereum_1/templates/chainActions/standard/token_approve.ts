import { ChainActionType, TokenApproveParams } from '../../../../../models'
import { EthereumTransactionAction, EthereumDecomposeReturn } from '../../../models'
import {
  composeAction as erc20TokenApproveComposeAction,
  decomposeAction as erc20TokenApproveDecomposeAction,
} from '../chainSpecific/erc20_approve'

// Calls ERC20Approve as default token template for Ethereum
export const composeAction = ({ fromAccountName, toAccountName, amount, contractName }: TokenApproveParams) => ({
  ...erc20TokenApproveComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    spender: toAccountName,
    value: amount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const decomposed = erc20TokenApproveDecomposeAction(action)
  const { contractAddress, from, spender } = decomposed.args
  if (decomposed) {
    return {
      ...decomposed,
      args: {
        ...decomposed.args,
        // coerce to string as EthereumAddress could be Buffer type
        contractAddress: contractAddress as string,
        from: from as string,
        spender: spender as string,
      },
      chainActionType: ChainActionType.TokenApprove,
    }
  }
  return null
}
