import BN from 'bn.js'
import { EthUnit, EthereumTransactionAction } from '../../../models'
import { ethereumTrxArgIsNullOrEmpty, toWeiString } from '../../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../../ethConstants'
import { ChainActionType, ValueTransferParams, ActionDecomposeReturn } from '../../../../../models'
import { toChainEntityName } from '../../../../../helpers'

/** Sends ETH (in units of Wei) */
export const composeAction = ({
  fromAccountName,
  toAccountName,
  amount,
  symbol = DEFAULT_ETH_SYMBOL,
}: ValueTransferParams) => {
  const value = toWeiString(amount, symbol as EthUnit) // using 0 precision since the toWei already converts to right precision for EthUnit
  return {
    from: fromAccountName,
    to: toAccountName,
    value: new BN(value, 10), // must be a hex '0x' string or BN
  }
}

export const decomposeAction = (action: EthereumTransactionAction): ActionDecomposeReturn => {
  const { to, from, value, data, contract } = action
  if (to && value && !contract && ethereumTrxArgIsNullOrEmpty(data)) {
    const returnData: ValueTransferParams = {
      // coerce to string as EthereumAddress could be Buffer type
      toAccountName: toChainEntityName(to as string),
      fromAccountName: toChainEntityName(from as string),
      amount: value as string,
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
