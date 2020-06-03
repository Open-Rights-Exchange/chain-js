import { BN } from 'ethereumjs-util'
import { EthUnit, EthereumTransactionAction } from '../../../models'
import { toWei, ethereumTrxArgIsNullOrEmpty } from '../../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../../ethConstants'
import { ChainActionType, ValueTransferParams, ActionDecomposeReturn } from '../../../../../models'
import { toChainEntityName } from '../../../../../helpers'

/** Sends ETH (in units of Wei) */
export const composeAction = ({
  fromAccountName,
  toAccountName,
  amount,
  symbol = DEFAULT_ETH_SYMBOL,
}: ValueTransferParams) => ({
  from: fromAccountName,
  to: toAccountName,
  value: toWei(amount, symbol as EthUnit),
})

export const decomposeAction = (action: EthereumTransactionAction): ActionDecomposeReturn => {
  const { to, from, value, data, contract } = action
  if (to && value && !contract && ethereumTrxArgIsNullOrEmpty(data)) {
    const returnData: ValueTransferParams = {
      // coerce to string as EthereumAddress could be Buffer type
      toAccountName: toChainEntityName(to as string),
      fromAccountName: toChainEntityName(from as string),
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
