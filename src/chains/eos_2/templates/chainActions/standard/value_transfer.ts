import { ValueTransferParams, ActionDecomposeReturn, ChainActionType } from '../../../../../models'
import { toEosEntityName, toEosSymbol } from '../../../helpers'
import {
  composeAction as eosTokenTransferComposeAction,
  decomposeAction as eosTokenTransferDecomposeAction,
  TokenTransferParams as EosTokenTransferParams,
} from '../chainSpecific/eosToken_transfer'
import { NATIVE_CHAIN_SYMBOL, DEFAULT_CHAIN_TOKEN_ADDRESS } from '../../../eosConstants'

/** a value transfer for EOS just calls the standard transfer function
 *  if no contractName or tokenSymbol is provided, use the chain defauult (e.g. 'EOS') */
export const composeAction = (params: ValueTransferParams) => {
  const { amount, contractName, symbol, permission } = params
  return eosTokenTransferComposeAction({
    ...params,
    amount,
    contractName: contractName || toEosEntityName(DEFAULT_CHAIN_TOKEN_ADDRESS),
    permission: permission ? toEosEntityName(permission) : toEosEntityName('active'),
    symbol: symbol ? toEosSymbol(symbol) : toEosSymbol(NATIVE_CHAIN_SYMBOL),
  } as EosTokenTransferParams)
}

export const decomposeAction = (action: any): ActionDecomposeReturn => {
  const decomposed = eosTokenTransferDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.ValueTransfer,
    }
  }
  return null
}
