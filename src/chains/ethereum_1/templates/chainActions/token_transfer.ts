import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import {
  composeAction as tokenTransferComposeAction,
  decomposeAction as tokenTransferDecomposeAction,
} from './erc20_transfer'

interface tokenTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
}

// Calls ERC20Transfer as default token template for Ethereum
export const composeAction = ({ fromAccountName, toAccountName, tokenAmount, contractName }: tokenTransferParams) => ({
  ...tokenTransferComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    to: toAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  return {
    ...tokenTransferDecomposeAction(action),
    chainActionType: ChainActionType.TokenTransfer,
  }
}
