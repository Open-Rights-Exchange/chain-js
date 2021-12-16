import * as algosdk from 'algosdk'
import { Helpers } from '@open-rights-exchange/chainjs'
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
// import { isNullOrEmpty } from '../../../../../helpers'

/**
 * Composes key registration action */
export const composeAction = async (args: AlgorandKeyRegistrationParams, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, note, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, reKeyTo } = argsEncodedForSdk
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
  if (!Helpers.isNullOrEmpty(reKeyTo)) {
    composedAction.addRekey(reKeyTo)
  }
  const actionHelper = new AlgorandActionHelper(composedAction)
  return actionHelper.action // convert raw action to use hex strings
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
