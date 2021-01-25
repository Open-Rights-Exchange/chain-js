import { ChainActionType } from '../../models'
import { byteArrayToHexString, isHexString, notSupported } from '../../helpers'
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
  AlgoClient,
  AlgorandChainActionType,
  AlgorandChainTransactionParamsStruct,
  AlgorandTxAction,
  AlgorandTxActionRaw,
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

/** compile an uncompiled TEAL program (into a Uint8Array) */
export async function compileFromSourceCode(sourceCode: string, algoClient: AlgoClient): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const programBytes = encoder.encode(sourceCode)
  const compileResponse = await algoClient.compile(programBytes).do()
  return new Uint8Array(Buffer.from(compileResponse.result, 'base64'))
}

/** compile the TEAL program if needed */
export async function compileIfSourceCodeAndEncode(
  program: string | Uint8Array,
  algoClient: AlgoClient,
): Promise<string> {
  if (isHexString(program)) {
    return program as string
  }
  // compile the uncompiled program (into a hex string)
  const byteCode = await compileFromSourceCode(program as string, algoClient)
  return byteArrayToHexString(byteCode)
}

// TODO: composeAction expects source code to be sent for appAprovalProgram & appClearProgram
// Must check if its not a valid hex before it assumes source code has been passed (isValidHex() will be impelemented)
/** Compose an object for a chain contract action */
export async function composeAction(
  chainState: AlgorandChainState,
  chainActionType: ChainActionType | AlgorandChainActionType,
  args: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
): Promise<AlgorandTxActionSdkEncoded> {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported(`ComposeAction:${chainActionType}`)
  }
  const appApprovalProgram = args?.appApprovalProgram
    ? await compileIfSourceCodeAndEncode(args.appApprovalProgram, chainState.algoClient)
    : undefined
  const appClearProgram = args?.appClearProgram
    ? await compileIfSourceCodeAndEncode(args.appClearProgram, chainState.algoClient)
    : undefined
  const appArgs = args?.appArgs // TODO: check if appArgs are valid base64 encoded, if not encode to base64

  const action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded = {
    ...args,
    appApprovalProgram,
    appClearProgram,
    appArgs,
  } as AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded
  let actionHelper = new AlgorandActionHelper(action)
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
