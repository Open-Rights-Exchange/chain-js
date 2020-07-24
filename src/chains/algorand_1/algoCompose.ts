import { ChainActionType } from '../../models'
import { notSupported } from '../../helpers'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
import { composeAction as AssetTransferTemplate } from './templates/chainActions/chainSpecific/asset_transfer'
import {
  AlgorandChainActionType,
  AlgorandChainTransactionParamsStruct,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxHeaderParams,
} from './models'
import { AlgorandChainState } from './algoChainState'
import { AlgorandActionHelper } from './algoAction'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any, suggestedParams: AlgorandTxHeaderParams) => any } = {
  // Standard actions
  ValueTransfer: ValueTransferTemplate,
  // Algorand actions
  AssetTransfer: AssetTransferTemplate,
}

/** Compose an object for a chain contract action */
export async function composeAction(
  chainState: AlgorandChainState,
  chainActionType: ChainActionType | AlgorandChainActionType,
  args: any,
): Promise<AlgorandTxAction> {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported()
  }

  let actionHelper = new AlgorandActionHelper(args)
  const chainTxHeaderParams: AlgorandChainTransactionParamsStruct = await chainState.algoClient.getTransactionParams()
  actionHelper.applyCurrentTxHeaderParamsWhereNeeded(chainTxHeaderParams)
  // seperate-out the action param values (required by compose functions) from the suggestedParams (headers)
  const rawAction: AlgorandTxActionRaw = composerFunction(actionHelper.paramsOnly, actionHelper.transactionHeaderParams)
  // use AlgorandActionHelper to drop empty fields
  actionHelper = new AlgorandActionHelper(rawAction)
  return {
    ...actionHelper.transactionHeaderParams,
    ...actionHelper.paramsOnly,
  }
}
