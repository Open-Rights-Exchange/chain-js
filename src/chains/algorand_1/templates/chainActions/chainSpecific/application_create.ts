import * as algosdk from 'algosdk'
import {
  AlgorandActionAppCreate,
  AlgorandDecomposeReturn,
  AlgorandChainActionType,
  AlgorandSuggestedParams,
  AlgorandTransactionTypeCode,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandOnApplicationComplete,
} from '../../../models'
import { AlgorandActionHelper } from '../../../algoAction'
import { isNullOrEmpty } from '../../../../../helpers'

/** Composes a transaction that changes an application's approval and clear programs */
export const composeAction = async (args: AlgorandActionAppCreate, suggestedParams: AlgorandSuggestedParams) => {
  const argsEncodedForSdk = new AlgorandActionHelper(args as AlgorandTxAction).actionEncodedForSdk
  const {
    from,
    appApprovalProgram,
    appClearProgram,
    appLocalInts,
    appLocalByteSlices,
    appGlobalInts,
    appGlobalByteSlices,
    appArgs,
    appAccounts,
    appForeignApps,
    appForeignAssets,
    note,
    lease,
    reKeyTo,
  } = argsEncodedForSdk
  const composedAction = algosdk.makeApplicationCreateTxn(
    from,
    suggestedParams,
    AlgorandOnApplicationComplete.NoOp,
    appApprovalProgram,
    appClearProgram,
    appLocalInts,
    appLocalByteSlices,
    appGlobalInts,
    appGlobalByteSlices,
    appArgs,
    appAccounts,
    appForeignApps,
    appForeignAssets,
    note,
    lease,
    reKeyTo,
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
  // Cant identify using only type (more than one action uses Application type) - must check params too
  if (
    actionParams?.type === AlgorandTransactionTypeCode.Application &&
    (actionParams?.appIndex === 0 || !actionParams?.appIndex) // This is 0 only for a create applicaiton transaction
  ) {
    const returnData = {
      ...actionParams,
    }
    return {
      chainActionType: AlgorandChainActionType.AppCreate,
      args: returnData,
    }
  }
  return null
}
