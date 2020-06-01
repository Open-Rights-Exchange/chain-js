import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import {
  composeAction as tokenTransferFromComposeAction,
  decomposeAction as tokenTransferFromDecomposeAction,
} from './erc20_transferFrom'

interface TokenTransferFromParams {
  approvedAccountName: EthereumAddress
  contractName: EthereumAddress
  fromAccountName: EthereumAddress
  toAccountName: EthereumAddress
  tokenAmount: number
}

// Calls ERC20TransferFrom as default token template for Ethereum
export const composeAction = ({
  approvedAccountName,
  fromAccountName,
  toAccountName,
  tokenAmount,
  contractName,
}: TokenTransferFromParams) => ({
  ...tokenTransferFromComposeAction({
    contractAddress: contractName,
    from: approvedAccountName,
    transferFrom: fromAccountName,
    to: toAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  if (tokenTransferFromDecomposeAction(action)) {
    return {
      ...tokenTransferFromDecomposeAction(action),
      chainActionType: ChainActionType.TokenTransfer,
    }
  }
  return null
}
