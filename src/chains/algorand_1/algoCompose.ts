import { ChainActionType } from '../../models'
import { notSupported } from '../../helpers'
import { AlgorandChainActionType } from './models/chainActionTypeModels'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
import { AlgorandTransactionAction } from './models/transactionModels'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  ValueTransfer: ValueTransferTemplate,
}

/** Compose an object for a chain contract action */
export function composeAction(
  chainActionType: ChainActionType | AlgorandChainActionType,
  args: any,
): AlgorandTransactionAction {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported()
  }
  return composerFunction(args)
}
