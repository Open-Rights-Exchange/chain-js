// import { toTokenValueString } from '../../../../../helpers'
// import { ActionDecomposeReturn, ChainActionType, TokenTransferParams } from '../../../../../models'
import { Models, Helpers } from '@open-rights-exchange/chainjs'
import {
  AlgorandSuggestedParams,
  AlgorandActionAssetTransferParams,
  AlgorandTxAction,
  AlgorandTxActionRaw,
} from '../../../models'
import {
  composeAction as algoAssetTransferComposeAction,
  decomposeAction as algoAssetTransferDecomposeAction,
} from '../chainSpecific/asset_transfer'

export const composeAction = (params: Models.TokenTransferParams, suggestedParams: AlgorandSuggestedParams): any => {
  const { amount: amountString, precision } = params
  // adjust string based on precicion e.g. '1.2' precision=4 => 12000
  const amount = parseInt(Helpers.toTokenValueString(amountString, 10, precision), 10)

  return algoAssetTransferComposeAction(
    {
      from: params.fromAccountName,
      to: params.toAccountName,
      amount,
      note: params.memo,
      assetIndex: parseInt(params.contractName, 10),
    } as AlgorandActionAssetTransferParams,
    suggestedParams,
  )
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): Models.ActionDecomposeReturn => {
  const decomposed = algoAssetTransferDecomposeAction(action)
  if (decomposed) {
    const decomposedArgs = decomposed.args
    return {
      args: {
        amount: decomposedArgs.amount.toString(), // todo to string with decimals
        precision: null, // cant determine this
        fromAccountName: decomposedArgs.from,
        toAccountName: decomposedArgs.to,
        memo: decomposedArgs.note,
        contractName: decomposedArgs.assetIndex.toString(),
        symbol: null,
      },
      chainActionType: Models.ChainActionType.TokenTransfer,
    }
  }
  return null
}
