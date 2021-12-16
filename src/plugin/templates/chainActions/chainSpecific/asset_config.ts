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
export const composeAction = async (
  args: AlgorandActionAssetConfigParams,
  suggestedParams: AlgorandSuggestedParams,
) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, note, assetIndex, assetManager, assetReserve, assetFreeze, assetClawback, reKeyTo } = argsEncodedForSdk
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
  if (!isNullOrEmpty(reKeyTo)) {
    composedAction.addRekey(reKeyTo)
  }
  const actionHelper = new AlgorandActionHelper(composedAction)
  return actionHelper.action // convert raw action to use hex strings
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
      !isNullOrEmpty(actionParams?.assetClawback)) &&
    isNullOrEmpty(actionParams?.assetName) &&
    isNullOrEmpty(actionParams?.assetUnitName)
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
