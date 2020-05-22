/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { decomposeAction as CategorySomeActionTemplate } from './templates/chainActions/categorySomeAction'
import { decomposeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { EthereumTransactionAction, EthereumDecomposeReturn } from './models'
import { isNullOrEmpty } from '../../helpers'

// map a key name to a function that returns an object
const DecomposeAction: { [key: string]: (args: any) => any } = {
  CategorySomeAction: CategorySomeActionTemplate,
  TokenTransfer: TokenTransferTemplate,
}

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export function decomposeAction(action: EthereumTransactionAction): EthereumDecomposeReturn[] {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const decomposedActions: EthereumDecomposeReturn[] = []

  // interate over all possible decompose and return all that can be decomposed (i.e returns a chainActionType from decomposeFunc)
  try {
    decomposeActionFuncs.forEach((decomposeFunc: any) => {
      const { chainActionType, args } = decomposeFunc(action) || {}
      if (chainActionType) {
        decomposedActions.push({ chainActionType, args })
      }
    })
  } catch (err) {
    console.log(err)
  }

  // return null and not an empty array if no matches
  return !isNullOrEmpty(decomposedActions) ? decomposedActions : null
}
