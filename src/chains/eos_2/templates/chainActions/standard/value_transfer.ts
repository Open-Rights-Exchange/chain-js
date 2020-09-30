import { ValueTransferParams, ActionDecomposeReturn, ChainActionType } from '../../../../../models'
import { toEosEntityName, toEosSymbol, toEosAssetPaddedAmount } from '../../../helpers'
import {
  composeAction as eosTokenTransferComposeAction,
  decomposeAction as eosTokenTransferDecomposeAction,
  EosTokenTransferParams,
} from '../chainSpecific/eosToken_transfer'
import { NATIVE_CHAIN_TOKEN_SYMBOL, NATIVE_CHAIN_TOKEN_ADDRESS } from '../../../eosConstants'

/** a value transfer for EOS just calls the standard transfer function
 *  if no contractName or tokenSymbol is provided, use the chain defauult (e.g. 'EOS') */
export const composeAction = (params: ValueTransferParams) => {
  const { amount, contractName, symbol, permission } = params
  return eosTokenTransferComposeAction({
    ...params,
    amount: toEosAssetPaddedAmount(amount, 4), // EOS token has precision 4
    contractName: contractName || toEosEntityName(NATIVE_CHAIN_TOKEN_ADDRESS),
    permission: permission ? toEosEntityName(permission) : toEosEntityName('active'),
    symbol: symbol ? toEosSymbol(symbol) : toEosSymbol(NATIVE_CHAIN_TOKEN_SYMBOL),
  } as EosTokenTransferParams)
}

export const decomposeAction = (action: any): ActionDecomposeReturn => {
  const decomposed = eosTokenTransferDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      // TODO EOS - should provide precision by reverse engineering eos asset string
      chainActionType: ChainActionType.ValueTransfer,
    }
  }
  return null
}
