import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandActionAssetTransferParams,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'

/**
 * Composes asset transfer action
 * Special case: to begin accepting assets, set amount=0 and fromAccountName=toAccountName */
export const composeAction = (args: AlgorandActionAssetTransferParams, suggestedParams: AlgorandSuggestedParams) => {
  const { from, to, amount, note, assetIndex, revocationTarget, closeRemainderTo } = args
  const noteEncoded = algosdk.encodeObj(note)
  const composedAction = algosdk.makeAssetTransferTxnWithSuggestedParams(
    from,
    to,
    closeRemainderTo || undefined,
    revocationTarget || undefined,
    amount,
    noteEncoded,
    assetIndex,
    suggestedParams,
  )
  return { ...composedAction }
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): AlgorandDecomposeReturn => {
  const actionHelper = new AlgorandActionHelper(action)
  const actionParams = actionHelper.paramsOnly
  // Identify chainActionType using type
  if (actionParams?.type === AlgorandTransactionTypeCode.AssetTransfer) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.AssetTransfer,
      args: returnData,
    }
  }
  return null
}
