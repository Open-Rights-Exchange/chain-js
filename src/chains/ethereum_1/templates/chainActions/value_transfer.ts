import { BN } from 'ethereumjs-util'
import { EthereumAddress, EthUnit, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { toWei, ethereumTrxArgIsNullOrEmpty } from '../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../ethConstants'
import { ChainActionType } from '../../../../models'

interface ValueTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName: EthereumAddress
  amount: number | BN
  symbol?: EthUnit
  // TODO: need memo - for compose and decompose
}

export const composeAction = ({
  fromAccountName,
  toAccountName,
  amount,
  symbol = DEFAULT_ETH_SYMBOL,
}: ValueTransferParams) => ({
  from: fromAccountName,
  to: toAccountName,
  value: toWei(amount, symbol),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, value, data, contract } = action
  if (to && value && !contract && ethereumTrxArgIsNullOrEmpty(data)) {
    // todo: this should only be a Partial if we canb't recover all the data
    const returnData: Partial<ValueTransferParams> = {
      toAccountName: to,
      fromAccountName: from,
      amount: value as BN,
      symbol: EthUnit.Wei,
    }
    const partial = !returnData?.fromAccountName
    return {
      chainActionType: ChainActionType.ValueTransfer,
      args: returnData,
      partial,
    }
  }

  return null
}
