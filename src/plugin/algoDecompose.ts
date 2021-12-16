import { Helpers } from '@open-rights-exchange/chainjs'
import { AlgorandTxAction, AlgorandTxActionRaw, AlgorandTxActionSdkEncoded, AlgorandDecomposeReturn } from './models'
// import { isNullOrEmpty } from '../../helpers'
import { decomposeAction as TokenTransferTemplate } from './templates/chainActions/standard/token_transfer'
import { decomposeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
import { decomposeAction as ApplicationClearTemplate } from './templates/chainActions/chainSpecific/application_clear'
import { decomposeAction as ApplicationCloseOutTemplate } from './templates/chainActions/chainSpecific/application_closeout'
import { decomposeAction as ApplicationCreateTemplate } from './templates/chainActions/chainSpecific/application_create'
import { decomposeAction as ApplicationDeleteTemplate } from './templates/chainActions/chainSpecific/application_delete'
import { decomposeAction as ApplicationNoOpTemplate } from './templates/chainActions/chainSpecific/application_noOp'
import { decomposeAction as ApplicationOptInTemplate } from './templates/chainActions/chainSpecific/application_optIn'
import { decomposeAction as ApplicationUpdateTemplate } from './templates/chainActions/chainSpecific/application_update'
import { decomposeAction as AssetConfigTemplate } from './templates/chainActions/chainSpecific/asset_config'
import { decomposeAction as AssetCreateTemplate } from './templates/chainActions/chainSpecific/asset_create'
import { decomposeAction as AssetDestroyTemplate } from './templates/chainActions/chainSpecific/asset_destroy'
import { decomposeAction as AssetFreezeTemplate } from './templates/chainActions/chainSpecific/asset_freeze'
import { decomposeAction as AssetTransferTemplate } from './templates/chainActions/chainSpecific/asset_transfer'
import { decomposeAction as KeyRegistrationTemplate } from './templates/chainActions/chainSpecific/key_registration'
import { decomposeAction as PaymentTemplate } from './templates/chainActions/chainSpecific/payment'

// map a key name to a function that returns an object
const DecomposeAction: { [key: string]: (args: any) => any } = {
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

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export async function decomposeAction(
  action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
): Promise<AlgorandDecomposeReturn[]> {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const decomposedActions: AlgorandDecomposeReturn[] = []

  // interate over all possible decompose and return all that can be decomposed (i.e returns a chainActionType from decomposeFunc)
  await Promise.all(
    decomposeActionFuncs.map(async (decomposeFunc: any) => {
      try {
        const { chainActionType, args } = (await decomposeFunc(action)) || {}
        if (chainActionType) {
          decomposedActions.push({ chainActionType, args })
        }
      } catch (err) {
        // console.log('problem in decomposeAction:', err)
      }
    }),
  )

  // return null and not an empty array if no matches
  return !Helpers.isNullOrEmpty(decomposedActions) ? decomposedActions : null
}
