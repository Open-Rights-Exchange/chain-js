import { ActionDecomposeReturn, ChainActionType, ValueTransferParams } from '../../../../../models'
import { AlgorandActionPaymentParams, AlgorandUnit, AlgorandSuggestedParams } from '../../../models'
import { toMicroAlgo } from '../../../helpers'
import { DEFAULT_ALGO_SYMBOL } from '../../../algoConstants'
import {
  composeAction as algoPaymentComposeAction,
  decomposeAction as algoPaymentDecomposeAction,
} from '../chainSpecific/payment'

export const composeAction = (params: ValueTransferParams, suggestedParams: AlgorandSuggestedParams): any => {
  const { amount: amountString, symbol = DEFAULT_ALGO_SYMBOL } = params
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

export const decomposeAction = (action: any): ActionDecomposeReturn => {
  const decomposed = algoPaymentDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.ValueTransfer,
    }
  }
  return null
}
