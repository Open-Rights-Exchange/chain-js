import * as algosdk from 'algosdk'
import { isNullOrEmpty } from '../../../../../helpers'
import {
  AlgorandDecomposeReturn,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandActionAssetCreateParams,
  AlgorandTxActionSdkEncoded,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'

/**
 * Composes asset create action */
export const composeAction = (args: AlgorandActionAssetCreateParams, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const {
    from,
    note,
    assetTotal,
    decimals,
    assetDefaultFrozen,
    assetManager,
    assetReserve,
    assetFreeze,
    assetClawback,
    assetUnitName,
    assetName,
    assetURL,
    assetMetadataHash,
  } = argsEncodedForSdk
  const composedAction = algosdk.makeAssetCreateTxnWithSuggestedParams(
    from,
    note,
    assetTotal,
    decimals,
    assetDefaultFrozen,
    assetManager,
    assetReserve,
    assetFreeze,
    assetClawback,
    assetUnitName,
    assetName,
    assetURL,
    assetMetadataHash,
    suggestedParams,
  )

  return { ...composedAction }
}

export const decomposeAction = (
  action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly

  // Identify chainActionType using type
  if (actionParams?.type === AlgorandTransactionTypeCode.AssetConfig && !isNullOrEmpty(actionParams?.assetName)) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.AssetCreate,
      args: returnData,
    }
  }
  return null
}
