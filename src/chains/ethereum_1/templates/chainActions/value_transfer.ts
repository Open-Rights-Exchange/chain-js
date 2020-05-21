import { EthereumAddress, EthUnit, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { toWei } from '../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../ethConstants'
import { ChainActionType } from '../../../../models'

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
      chainActionType: ChainActionType.ValueTransfer,
      args: { ...action },
    }
  }

  return null
}
