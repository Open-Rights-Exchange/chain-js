/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { ChainActionType } from '../../models'
import { notSupported } from '../../helpers'

import { composeAction as CategorySomeActionTemplate } from './templates/chainActions/categorySomeAction'
import { composeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { EthereumTransactionAction, EthereumChainActionType } from './models'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any) => any } = {
  CategorySomeAction: CategorySomeActionTemplate,
  TokenTransfer: TokenTransferTemplate,
}

/** Compose an object for a chain contract action */
export function composeAction(
  chainActionType: ChainActionType | EthereumChainActionType,
  args: any,
): EthereumTransactionAction {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported()
  }
  return composerFunction(args)
}
