/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { ChainActionType } from '../../models'

import { decomposeAction as CategorySomeActionTemplate } from './templates/chainActions/categorySomeAction'
import { decomposeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { EthereumTransactionAction, EthereumChainActionType } from './models'

// map a key name to a function that returns an object
export const ChainAction: { [key: string]: (args: any) => any } = {
  CategorySomeAction: CategorySomeActionTemplate,
  TokenTransfer: TokenTransferTemplate,
}

export function decomposeAction(
  action: EthereumTransactionAction,
): { chainActionType: ChainActionType | EthereumChainActionType; args: any } {
  const decomposeActionFuncs = Object.values(ChainAction)
  let actionData = null

  // Using find to stop iterating once a match is found
  decomposeActionFuncs.find((decomposeFunc: any) => {
    const { actionType, args } = decomposeFunc(action) || {}
    if (actionType) {
      actionData = { chainActionType: actionType, args }
      return true
    }
    return null
  })

  return actionData
}
