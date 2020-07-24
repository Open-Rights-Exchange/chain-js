import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandActionPaymentParams,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'

/** Compose action */
export const composeAction = (args: AlgorandActionPaymentParams, suggestedParams: AlgorandSuggestedParams) => {
  const { from, to, amount, note, closeRemainderTo } = args
  const noteEncoded = algosdk.encodeObj(note)
  const composedAction = algosdk.makePaymentTxnWithSuggestedParams(
    from,
    to,
    amount,
    closeRemainderTo || undefined,
    noteEncoded,
    suggestedParams,
  )
  const actionHelper = new AlgorandActionHelper(composedAction)
  return actionHelper.action // convert raw action to use hex strings
}

/** Decompose action */
export const decomposeAction = (action: any): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const { amount, from, note, to, closeRemainderTo, type } = actionHelper.action
  // Identify chainActionType using type
  if (type === AlgorandTransactionTypeCode.Payment) {
    const returnData = {
      from,
      to,
      amount,
      closeRemainderTo,
      note,
    }
    return {
      chainActionType: AlgorandChainActionType.Payment,
      args: returnData,
    }
  }
  return null
}
