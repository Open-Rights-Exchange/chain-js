import { ActionDecomposeReturn } from '../../models'
import { AlgorandTransactionAction } from './models/transactionModels'
import { isNullOrEmpty } from '../../helpers'
import { decomposeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'

// map a key name to a function that returns an object
const DecomposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  ValueTransfer: ValueTransferTemplate,
}

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export function decomposeAction(action: AlgorandTransactionAction): ActionDecomposeReturn[] {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const decomposedActions: ActionDecomposeReturn[] = []

  // interate over all possible decompose and return all that can be decomposed (i.e returns a chainActionType from decomposeFunc)
  decomposeActionFuncs.forEach((decomposeFunc: any) => {
    try {
      const { chainActionType, args } = decomposeFunc(action) || {}
      if (chainActionType) {
        decomposedActions.push({ chainActionType, args })
      }
    } catch (err) {
      // console.log('problem in decomposeAction:', err)
    }
  })

  // return null and not an empty array if no matches
  return !isNullOrEmpty(decomposedActions) ? decomposedActions : null
}
