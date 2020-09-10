import { EthUnit, EthereumTransactionAction } from '../../../models'
import { ChainActionType, ValueTransferParams, ActionDecomposeReturn } from '../../../../../models'
import {
  composeAction as ethTransferComposeAction,
  decomposeAction as ethTransferDecomposeAction,
  EthTransferParams,
} from '../chainSpecific/eth_transfer'

/** Sends ETH (in units of Wei) */
export const composeAction = (params: ValueTransferParams) => {
  const { fromAccountName, toAccountName, amount } = params
  return ethTransferComposeAction({
    from: fromAccountName,
    to: toAccountName,
    value: amount,
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
