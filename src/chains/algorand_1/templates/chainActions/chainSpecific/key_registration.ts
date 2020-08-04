import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandKeyRegistrationParams,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'

/**
 * Composes key registration action */
export const composeAction = (args: AlgorandKeyRegistrationParams, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, note, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution } = argsEncodedForSdk
  const composedAction = algosdk.makeKeyRegistrationTxnWithSuggestedParams(
    from,
    note,
    voteKey,
    selectionKey,
    voteFirst,
    voteLast,
    voteKeyDilution,
    suggestedParams,
  )
  return { ...composedAction }
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly
  // Identify chainActionType using type
  if (actionParams?.type === AlgorandTransactionTypeCode.KeyRegistration) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.KeyRegistration,
      args: returnData,
    }
  }
  return null
}
