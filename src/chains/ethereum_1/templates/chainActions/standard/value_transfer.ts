import { EthUnit, EthereumTransactionAction } from '../../../models'
import { toWeiString } from '../../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../../ethConstants'
import { ChainActionType, ValueTransferParams, ActionDecomposeReturn } from '../../../../../models'
import {
  composeAction as ethTransferComposeAction,
  decomposeAction as ethTransferDecomposeAction,
  EthTransferParams,
} from '../chainSpecific/eth_transfer'

/** Sends ETH (in units of Wei) */
export const composeAction = (params: ValueTransferParams) => {
  const { fromAccountName, toAccountName, amount, symbol = DEFAULT_ETH_SYMBOL } = params
  const value = toWeiString(amount, symbol as EthUnit) // using 0 precision since the toWei already converts to right precision for EthUnit
  return ethTransferComposeAction({
    from: fromAccountName,
    to: toAccountName,
    value,
  } as EthTransferParams)
}

export const decomposeAction = (action: EthereumTransactionAction): ActionDecomposeReturn => {
  const decomposed = ethTransferDecomposeAction(action)
  if (decomposed) {
    const decomposedArgs = decomposed.args
    return {
      args: {
        amount: decomposedArgs.value,
        fromAccountName: decomposedArgs.from,
        toAccountName: decomposedArgs.to,
        symbol: EthUnit.Wei,
      },
      chainActionType: ChainActionType.ValueTransfer,
      partial: decomposedArgs.partial,
    }
  }
  return null
}
