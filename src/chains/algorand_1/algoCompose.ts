import { ChainActionType } from '../../models'
import { notSupported } from '../../helpers'
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
  AlgorandTxActionSdkEncoded,
  AlgorandTxHeaderParams,
} from './models'
import { AlgorandChainState } from './algoChainState'
import { AlgorandActionHelper } from './algoAction'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any, suggestedParams: AlgorandTxHeaderParams) => any } = {
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

/** Compose an object for a chain contract action */
export async function composeAction(
  chainState: AlgorandChainState,
  chainActionType: ChainActionType | AlgorandChainActionType,
  args: any,
): Promise<AlgorandTxActionSdkEncoded> {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported(`ComposeAction:${chainActionType}`)
  }

  let actionHelper = new AlgorandActionHelper(args)
  const chainTxHeaderParams: AlgorandChainTransactionParamsStruct =
    chainState.chainInfo?.nativeInfo?.transactionHeaderParams
  actionHelper.applyCurrentTxHeaderParamsWhereNeeded(chainTxHeaderParams)
  // seperate-out the action param values (required by compose functions) from the suggestedParams (headers)
  const sdkEncodedActionParams: AlgorandTxActionSdkEncoded = composerFunction(
    actionHelper.paramsOnly,
    actionHelper.transactionHeaderParams,
  )
  // use AlgorandActionHelper to drop empty fields
  actionHelper = new AlgorandActionHelper(sdkEncodedActionParams as AlgorandTxActionSdkEncoded)
  return sdkEncodedActionParams
}
