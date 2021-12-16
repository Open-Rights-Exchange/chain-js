import * as algosdk from 'algosdk'
import { Helpers } from '@open-rights-exchange/chainjs'
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
// import { isNullOrEmpty } from '../../../../../helpers'

/**
 * Composes asset freeze action */
export const composeAction = async (
  args: AlgorandActionAssetFreezeParams,
  suggestedParams: AlgorandSuggestedParams,
) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const { from, note, assetIndex, freezeAccount, freezeState, reKeyTo } = argsEncodedForSdk
  const composedAction = algosdk.makeAssetFreezeTxnWithSuggestedParams(
    from,
    note,
    assetIndex,
    freezeAccount,
    freezeState,
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
