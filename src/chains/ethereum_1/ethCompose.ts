/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { ChainActionType } from '../../models'

import { action as CategorySomeActionTemplate } from './templates/chainActions/categorySomeAction'
import { action as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { EthereumTransactionAction } from './models'

// map a key name to a function that returns an object
export const ChainAction: { [key: string]: (args: any) => any } = {
  CategorySomeAction: CategorySomeActionTemplate,
  TokenTransfer: TokenTransferTemplate,
}

export enum EthereumChainActionType {}

export function composeAction(
  actionType: ChainActionType | EthereumChainActionType,
  args: any,
): EthereumTransactionAction {
  // const composerFunction = ChainActionType[actionType];
  const composerFunction = ChainAction[actionType as string]
  return composerFunction(args)
}

export function decomposeAction(
  action: EthereumTransactionAction,
): { chainActionType: ChainActionType | EthereumChainActionType; args: any } {
  // mirror functionality of EOS chain eosCompose.decomposeAction
  return null
}
