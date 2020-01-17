/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */
import { action as CategorySomeActionTemplate } from './templates/chainActions/categorySomeAction'
import { ChainActionType } from '../../models'

// map a key name to a function that returns an object
export const ChainAction: { [key: string]: (args: any) => any } = {
  CategorySomeAction: CategorySomeActionTemplate,
}

export enum EthereumChainActionType {
  CategorySomeAction = 'CategorySomeAction',
}

export function composeAction(actionType: ChainActionType | EthereumChainActionType, args: any): any {
  if (typeof actionType !== 'function') {
    return null
    // throw new Error('composeAction called with invalid or missing actionType:', actionType);
  }
  // const composerFunction = ChainActionType[actionType];
  const composerFunction = ChainAction[actionType as string]

  return composerFunction(args)
}
