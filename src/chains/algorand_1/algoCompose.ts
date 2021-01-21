import { ChainActionType } from '../../models'
import { byteArrayToHexString, isValidHex, notSupported } from '../../helpers'
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

export async function compileFromSourceCode(sourceCode: string, algoClient: AlgoClient): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const programBytes = encoder.encode(sourceCode)
  console.log('programbytes: ', programBytes)
  const compileResponse = await algoClient.compile(programBytes).do()
  return new Uint8Array(Buffer.from(compileResponse.result, 'base64'))
}
export async function compileIfSourceCodeAndEncode(
  program: string | Uint8Array,
  algoClient: AlgoClient,
): Promise<string> {
  console.log('itshere')
  let byteCode: Uint8Array
  if (!isValidHex(program as string)) {
    byteCode = await compileFromSourceCode(program as string, algoClient)
    console.log('BYTECODE: ', byteCode)
  }
  return byteArrayToHexString(byteCode)
}

export async function compileIfSourceCodeAppArgs(appArgs: string[], algoClient: AlgoClient) {
  return Promise.all(appArgs.map(arg => compileIfSourceCodeAndEncode(arg, algoClient)))
}

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
  console.log('beforeaction', args)
  const approvalProgram = args?.approvalProgram
    ? await compileIfSourceCodeAndEncode(args.approvalProgram, chainState.algoClient)
    : undefined
  const clearProgram = args?.clearProgram
    ? await compileIfSourceCodeAndEncode(args.clearProgram, chainState.algoClient)
    : undefined
  const appArgs = args?.appArgs ? await compileIfSourceCodeAppArgs(args?.appArgs, chainState.algoClient) : undefined

  const action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded = {
    ...args,
    approvalProgram,
    clearProgram,
    appArgs,
  } as AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded
  console.log('ACTION: ', action)
  let actionHelper = new AlgorandActionHelper(action)
  const chainTxHeaderParams: AlgorandChainTransactionParamsStruct =
    chainState.chainInfo?.nativeInfo?.transactionHeaderParams
  actionHelper.applyCurrentTxHeaderParamsWhereNeeded(chainTxHeaderParams)
  // seperate-out the action param values (required by compose functions) from the suggestedParams (headers)
  console.log('ACTIONHELPERSPARAMS', actionHelper.paramsOnly, actionHelper.transactionHeaderParams)
  const sdkEncodedActionParams: AlgorandTxActionSdkEncoded = composerFunction(
    actionHelper.paramsOnly,
    actionHelper.transactionHeaderParams,
  )
  // use AlgorandActionHelper to drop empty fields
  actionHelper = new AlgorandActionHelper(sdkEncodedActionParams as AlgorandTxActionSdkEncoded)
  return sdkEncodedActionParams
}
