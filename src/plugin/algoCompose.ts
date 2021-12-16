import { Models, Helpers } from '@open-rights-exchange/chainjs'
import { composeAction as TokenTransferTemplate } from './templates/chainActions/standard/token_transfer'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
import { composeAction as ApplicationClearTemplate } from './templates/chainActions/chainSpecific/application_clear'
import { composeAction as ApplicationCloseOutTemplate } from './templates/chainActions/chainSpecific/application_closeout'
import { composeAction as ApplicationCreateTemplate } from './templates/chainActions/chainSpecific/application_create'
import { composeAction as ApplicationDeleteTemplate } from './templates/chainActions/chainSpecific/application_delete'
import { composeAction as ApplicationNoOpTemplate } from './templates/chainActions/chainSpecific/application_noOp'
import { composeAction as ApplicationOptInTemplate } from './templates/chainActions/chainSpecific/application_optIn'
import { composeAction as ApplicationUpdateTemplate } from './templates/chainActions/chainSpecific/application_update'
import { composeAction as AssetConfigTemplate } from './templates/chainActions/chainSpecific/asset_config'
import { composeAction as AssetCreateTemplate } from './templates/chainActions/chainSpecific/asset_create'
import { composeAction as AssetDestroyTemplate } from './templates/chainActions/chainSpecific/asset_destroy'
import { composeAction as AssetFreezeTemplate } from './templates/chainActions/chainSpecific/asset_freeze'
import { composeAction as AssetTransferTemplate } from './templates/chainActions/chainSpecific/asset_transfer'
import { composeAction as KeyRegistrationTemplate } from './templates/chainActions/chainSpecific/key_registration'
import { composeAction as PaymentTemplate } from './templates/chainActions/chainSpecific/payment'

import {
  AlgorandChainActionType,
  AlgorandChainTransactionParamsStruct,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxActionSdkEncoded,
  AlgorandTxHeaderParams,
} from './models'
import { AlgorandChainState } from './algoChainState'
import { AlgorandActionHelper } from './algoAction'
import { compileIfSourceCodeIfNeeded } from './helpers'

// map a key name to a function that returns an object
const ComposeAction: {
  [key: string]: (args: any, suggestedParams: AlgorandTxHeaderParams) => any
} = {
  // Standard actions
  TokenTransfer: TokenTransferTemplate,
  ValueTransfer: ValueTransferTemplate,
  // Algorand actions
  AssetConfig: AssetConfigTemplate,
  AssetCreate: AssetCreateTemplate,
  AssetDestroy: AssetDestroyTemplate,
  AssetFreeze: AssetFreezeTemplate,
  AssetTransfer: AssetTransferTemplate,
  AppClear: ApplicationClearTemplate,
  AppCloseOut: ApplicationCloseOutTemplate,
  AppCreate: ApplicationCreateTemplate,
  AppDelete: ApplicationDeleteTemplate,
  AppNoOp: ApplicationNoOpTemplate,
  AppOptIn: ApplicationOptInTemplate,
  AppUpdate: ApplicationUpdateTemplate,
  KeyRegistration: KeyRegistrationTemplate,
  Payment: PaymentTemplate,
}

// Must check if its not a valid hex before it assumes source code has been passed (isValidHex() will be impelemented)
/** Compose an object for a chain contract action */
export async function composeAction(
  chainState: AlgorandChainState,
  chainActionType: Models.ChainActionType | AlgorandChainActionType,
  args: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
): Promise<AlgorandTxActionSdkEncoded> {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    Helpers.notSupported(`ComposeAction:${chainActionType}`)
  }

  const action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded = {
    ...args,
    appApprovalProgram: await compileIfSourceCodeIfNeeded(args.appApprovalProgram, chainState.algoClient),
    appClearProgram: await compileIfSourceCodeIfNeeded(args.appClearProgram, chainState.algoClient),
  } as AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded

  let actionHelper = new AlgorandActionHelper(action)
  const chainTxHeaderParams: AlgorandChainTransactionParamsStruct =
    chainState.chainInfo?.nativeInfo?.transactionHeaderParams
  actionHelper.applyCurrentTxHeaderParamsWhereNeeded(chainTxHeaderParams)
  // seperate-out the action param values (required by compose functions) from the suggestedParams (headers)
  const sdkEncodedActionParams: AlgorandTxActionSdkEncoded = await composerFunction(
    actionHelper.paramsOnly,
    actionHelper.transactionHeaderParams,
  )
  // use AlgorandActionHelper to drop empty fields
  actionHelper = new AlgorandActionHelper(sdkEncodedActionParams as AlgorandTxActionSdkEncoded)
  return sdkEncodedActionParams
}
