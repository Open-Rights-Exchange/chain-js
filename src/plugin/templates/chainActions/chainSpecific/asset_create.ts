import * as algosdk from 'algosdk'
// import { isNullOrEmpty } from '../../../../../helpers'
import { Helpers } from '@open-rights-exchange/chainjs'
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
export const composeAction = async (
  args: AlgorandActionAssetCreateParams,
  suggestedParams: AlgorandSuggestedParams,
) => {
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
    reKeyTo,
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
  if (!Helpers.isNullOrEmpty(reKeyTo)) {
    composedAction.addRekey(reKeyTo)
  }
  const actionHelper = new AlgorandActionHelper(composedAction)
  return actionHelper.action // convert raw action to use hex strings
}

export const decomposeAction = (
  action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly
  // Cant identify using only type (more than one action uses AssetConfig type) - must check params too
  if (
    actionParams?.type === AlgorandTransactionTypeCode.AssetConfig &&
    !Helpers.isNullOrEmpty(actionParams?.assetName)
  ) {
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
