import * as algosdk from 'algosdk'
import {
  AlgorandDecomposeReturn,
  AlgorandActionAssetTransferParams,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
} from '../../../models'

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

/**
 * Decomposes asset transfer action */
export const decomposeAction = (action: AlgorandTxAction): AlgorandDecomposeReturn => {
  const { type } = action
  if (type === AlgorandTransactionTypeCode.AssetTransfer) {
    const returnData = {
      ...action,
    }
    return {
      chainActionType: AlgorandChainActionType.AssetTransfer,
      args: returnData,
    }
  }
  return null
}
