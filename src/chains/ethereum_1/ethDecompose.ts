/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { ChainActionType } from '../../models'

import { decomposeAction as CategorySomeActionTemplate } from './templates/chainActions/categorySomeAction'
import { decomposeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { EthereumTransactionAction, EthereumChainActionType } from './models'
import { isNullOrEmpty } from '../../helpers'

// map a key name to a function that returns an object
const DecomposeAction: { [key: string]: (args: any) => any } = {
  CategorySomeAction: CategorySomeActionTemplate,
  TokenTransfer: TokenTransferTemplate,
}

type DecomposeActionResponse = {
  chainActionType: ChainActionType | EthereumChainActionType
  args: any
}

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export function decomposeAction(action: EthereumTransactionAction): DecomposeActionResponse[] {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const actionData: any[] = []

  // interate over all possible decompose and return all that can be decomposed (i.e returns a chainActionType from decomposeFunc)
  decomposeActionFuncs.forEach((decomposeFunc: any) => {
    const { actionType, args } = decomposeFunc(action) || {}
    if (actionType) {
      actionData.push({ chainActionType: actionType, args })
      return true
    }
    return false
  })
  // return null and not an empty array if no matches
  return !isNullOrEmpty(actionData) ? actionData : null
}
