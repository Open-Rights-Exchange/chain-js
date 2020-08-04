import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandActionAssetConfigParams,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'
import { isNullOrEmpty } from '../../../../../helpers'

/**
 * Composes asset config action */
export const composeAction = (args: AlgorandActionAssetConfigParams, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, note, assetIndex, assetManager, assetReserve, assetFreeze, assetClawback } = argsEncodedForSdk
  const composedAction = algosdk.makeAssetConfigTxnWithSuggestedParams(
    from,
    note,
    assetIndex,
    assetManager,
    assetReserve,
    assetFreeze,
    assetClawback,
    suggestedParams,
    args.strictEmptyAddressChecking,
  )
  return { ...composedAction }
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly
  // Cant identify using only type (more than one action uses AssetConfig type) - must check params too
  if (
    actionParams?.type === AlgorandTransactionTypeCode.AssetConfig &&
    (!isNullOrEmpty(actionParams?.assetManager) ||
      !isNullOrEmpty(actionParams?.assetReserve) ||
      !isNullOrEmpty(actionParams?.assetFreeze) ||
      !isNullOrEmpty(actionParams?.assetClawback))
  ) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.AssetConfig,
      args: returnData,
    }
  }
  return null
}
