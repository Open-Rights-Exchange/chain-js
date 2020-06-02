import { ChainActionType, TokenTransferFromParams } from '../../../../../models'
import { EthereumTransactionAction, EthereumDecomposeReturn } from '../../../models'
import {
  composeAction as erc20TokenTransferFromComposeAction,
  decomposeAction as erc20TokenTransferFromDecomposeAction,
} from '../chainSpecific/erc20_transferFrom'

// Calls ERC20TransferFrom as default token template for Ethereum
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

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const decomposed = erc20TokenTransferFromDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.TokenTransferFrom,
    }
  }
  return null
}
