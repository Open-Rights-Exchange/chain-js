import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandActionAssetDestroyParams,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'
import { isNullOrEmpty } from '../../../../../helpers'

/**
 * Composes asset transfer action
 * Special case: to begin accepting assets, set amount=0 and fromAccountName=toAccountName */
export const composeAction = (args: AlgorandActionAssetDestroyParams, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, note, assetIndex } = argsEncodedForSdk
  const composedAction = algosdk.makeAssetTransferTxnWithSuggestedParams(from, note, assetIndex, suggestedParams)
  return { ...composedAction }
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly
  // Identify chainActionType using type
  if (
    actionParams?.type === AlgorandTransactionTypeCode.AssetConfig &&
    isNullOrEmpty(actionParams?.assetManager) &&
    isNullOrEmpty(actionParams?.assetReserve) &&
    isNullOrEmpty(actionParams?.assetFreeze) &&
    isNullOrEmpty(actionParams?.assetClawback) &&
    isNullOrEmpty(actionParams?.assetName)
  ) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.AssetDestroy,
      args: returnData,
    }
  }
  return null
}
