import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandActionPaymentParams,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'

/** Compose action */
export const composeAction = (args: AlgorandActionPaymentParams, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, to, amount, note, closeRemainderTo } = argsEncodedForSdk
  const composedAction = algosdk.makePaymentTxnWithSuggestedParams(
    from,
    to,
    amount,
    closeRemainderTo || undefined,
    note,
    suggestedParams,
  )
  const actionHelper = new AlgorandActionHelper(composedAction)
  return actionHelper.action // convert raw action to use hex strings
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly
  // Identify chainActionType using type
  if (actionParams?.type === AlgorandTransactionTypeCode.Payment) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.Payment,
      args: returnData,
    }
  }
  return null
}
