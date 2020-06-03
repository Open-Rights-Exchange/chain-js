import { ChainActionType, TokenTransferFromParams, ActionDecomposeReturn } from '../../../../../models'
import { EthereumTransactionAction } from '../../../models'
import {
  composeAction as erc20TokenTransferFromComposeAction,
  decomposeAction as erc20TokenTransferFromDecomposeAction,
} from '../chainSpecific/erc20_transferFrom'

/** Calls ERC20TransferFrom as default token template for Ethereum */
export const composeAction = ({
  approvedAccountName,
  contractName,
  fromAccountName,
  toAccountName,
  amount,
}: TokenTransferFromParams) => ({
  ...erc20TokenTransferFromComposeAction({
    contractAddress: contractName,
    from: approvedAccountName,
    transferFrom: fromAccountName,
    to: toAccountName,
    value: amount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): ActionDecomposeReturn => {
  const decomposed = erc20TokenTransferFromDecomposeAction(action)
  const { contractAddress, from, transferFrom, to, value } = decomposed.args
  if (decomposed) {
    return {
      ...decomposed,
      args: {
        ...decomposed.args,
        // coerce to string as EthereumAddress could be Buffer type
        contractName: contractAddress as string,
        approvedAccountName: from as string,
        fromAccountName: transferFrom as string,
        toAccountName: to as string,
        amount: value as number,
      },
      chainActionType: ChainActionType.TokenTransferFrom,
    }
  }
  return null
}
