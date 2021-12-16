import { ActionDecomposeReturn, ChainActionType, ValueTransferParams } from '../../../../../models'
import {
  AlgorandActionPaymentParams,
  AlgorandUnit,
  AlgorandSuggestedParams,
  AlgorandTxAction,
  AlgorandTxActionRaw,
} from '../../../models'
import { toMicroAlgo } from '../../../helpers'
import { DEFAULT_ALGO_UNIT } from '../../../algoConstants'
import {
  composeAction as algoPaymentComposeAction,
  decomposeAction as algoPaymentDecomposeAction,
} from '../chainSpecific/payment'

export const composeAction = (params: ValueTransferParams, suggestedParams: AlgorandSuggestedParams): any => {
  const { amount: amountString, symbol = DEFAULT_ALGO_UNIT } = params
  const amount = toMicroAlgo(amountString, symbol as AlgorandUnit)
  return algoPaymentComposeAction(
    {
      from: params.fromAccountName,
      to: params.toAccountName,
      amount,
      note: params.memo,
      symbol,
    } as AlgorandActionPaymentParams,
    suggestedParams,
  )
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): ActionDecomposeReturn => {
  const decomposed = algoPaymentDecomposeAction(action)
  if (decomposed) {
    const decomposedArgs = decomposed.args
    return {
      args: {
        amount: decomposedArgs.amount.toString(), // todo to string with decimals
        permission: null,
        fromAccountName: decomposedArgs.from,
        toAccountName: decomposedArgs.to,
        memo: decomposedArgs.note,
        contractName: null,
        symbol: AlgorandUnit.Algo, // the value is in microalgo, but the symbol name is 'algo'
      },
      chainActionType: ChainActionType.ValueTransfer,
    }
  }
  return null
}
