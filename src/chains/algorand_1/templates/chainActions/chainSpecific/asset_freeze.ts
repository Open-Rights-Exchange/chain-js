import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandActionAssetFreezeParams,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'

/**
 * Composes asset transfer action
 * Special case: to begin accepting assets, set amount=0 and fromAccountName=toAccountName */
export const composeAction = (args: AlgorandActionAssetFreezeParams, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, note, assetIndex, freezeAccount, freezeState } = argsEncodedForSdk
  const composedAction = algosdk.makeAssetTransferTxnWithSuggestedParams(
    from,
    note,
    assetIndex,
    freezeAccount,
    freezeState,
    suggestedParams,
  )
  return { ...composedAction }
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly
  // Identify chainActionType using type
  if (actionParams?.type === AlgorandTransactionTypeCode.AssetFreeze) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.AssetFreeze,
      args: returnData,
    }
  }
  return null
}
