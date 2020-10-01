import { ActionDecomposeReturn, ChainActionType, TokenTransferParams } from '../../../../../models'
import {
  AlgorandUnit,
  AlgorandSuggestedParams,
  AlgorandActionAssetTransferParams,
  AlgorandTxAction,
  AlgorandTxActionRaw,
} from '../../../models'
import { toMicroAlgo } from '../../../helpers'
import { DEFAULT_ALGO_UNIT } from '../../../algoConstants'
import {
  composeAction as algoAssetTransferComposeAction,
  decomposeAction as algoAssetTransferDecomposeAction,
} from '../chainSpecific/asset_transfer'

export const composeAction = (params: TokenTransferParams, suggestedParams: AlgorandSuggestedParams): any => {
  const { amount: amountString, symbol = DEFAULT_ALGO_UNIT } = params
  // TODO Algo - the amount conversion should be based off precision - not assume microAlgos - this is an asset not algos
  const amount = toMicroAlgo(amountString, symbol as AlgorandUnit)

  return algoAssetTransferComposeAction(
    {
      from: params.fromAccountName,
      to: params.toAccountName,
      amount,
      note: params.memo,
      symbol,
      assetIndex: parseInt(params.contractName, 10),
    } as AlgorandActionAssetTransferParams,
    suggestedParams,
  )
}

export const decomposeAction = (action: AlgorandTxAction | AlgorandTxActionRaw): ActionDecomposeReturn => {
  const decomposed = algoAssetTransferDecomposeAction(action)
  if (decomposed) {
    const decomposedArgs = decomposed.args
    return {
      args: {
        ...decomposedArgs,
        fromAccountName: decomposedArgs.from,
        toAccountName: decomposedArgs.to,
        memo: decomposedArgs.note,
        contractName: decomposedArgs.assetIndex,
      },
      chainActionType: ChainActionType.TokenTransfer,
    }
  }
  return null
}
