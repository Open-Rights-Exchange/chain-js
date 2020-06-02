import {
  EthereumAddress,
  EthUnit,
  EthereumChainActionType,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
} from '../../models'
import { toWei } from '../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../ethConstants'

interface valueTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName: EthereumAddress
  tokenAmount: number
  tokenSymbol?: EthUnit
}

export const composeAction = ({
  fromAccountName,
  toAccountName,
  tokenAmount,
  tokenSymbol = DEFAULT_ETH_SYMBOL,
}: valueTransferParams) => ({
  from: fromAccountName,
  to: toAccountName,
  value: toWei(tokenAmount, tokenSymbol),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, value } = action
  if (to && from && value) {
    return {
      chainActionType: EthereumChainActionType.ValueTransfer,
      args: { ...action },
    }
  }

  return null
}
