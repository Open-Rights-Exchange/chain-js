import { ValueTransferParams, ActionDecomposeReturn } from '../../../../../models'
import { toEosEntityName, toEosSymbol } from '../../../helpers'
import {
  composeAction as eosTokenTransferComposeAction,
  decomposeAction as eosTokenTransferDecomposeAction,
} from '../chainSpecific/eosToken_transfer'
import { DEFAULT_EOS_SYMBOL, DEFAULT_EOS_TOKEN_CONTRACT } from '../../../eosConstants'

/** a value transfer for EOS just calls the standard transfer function
 *  if no contractName or tokenSymbol is provided, use the chain defauult (e.g. 'EOS') */
export const composeAction = (params: ValueTransferParams) => {
  const { amount, contractName, symbol, permission } = params
  return eosTokenTransferComposeAction({
    ...params,
    amount: amount as number, // handle possible BN
    contractName: contractName || toEosEntityName(DEFAULT_EOS_TOKEN_CONTRACT),
    permission: permission ? toEosEntityName(permission) : toEosEntityName('active'),
    symbol: symbol ? toEosSymbol(symbol) : toEosSymbol(DEFAULT_EOS_SYMBOL),
  })
}

export const decomposeAction = (action: any): ActionDecomposeReturn => {
  return eosTokenTransferDecomposeAction(action) as ActionDecomposeReturn
}
