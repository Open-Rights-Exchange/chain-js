import { ActionDecomposeReturn } from '../../models'
import { AlgorandTxAction, AlgorandTxActionRaw, AlgorandTxActionSdkEncoded } from './models'
import { isNullOrEmpty } from '../../helpers'
import { decomposeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
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
  ValueTransfer: ValueTransferTemplate,
  // Algorand actions
  AssetConfig: AssetConfigTemplate,
  AssetCreate: AssetCreateTemplate,
  AssetDestroy: AssetDestroyTemplate,
  AssetFreeze: AssetFreezeTemplate,
  AssetTransfer: AssetTransferTemplate,
  KeyRegistration: KeyRegistrationTemplate,
  Payment: PaymentTemplate,
}

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export function decomposeAction(
  action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
): ActionDecomposeReturn[] {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const decomposedActions: ActionDecomposeReturn[] = []

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
  return !isNullOrEmpty(decomposedActions) ? decomposedActions : null
}
