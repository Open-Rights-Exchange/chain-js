import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosSymbol } from '../../models'
import { toEosEntityName, toEosSymbol } from '../../helpers'
import {
  composeAction as tokenTransferComposeAction,
  decomposeAction as tokenTransferDecomposeAction,
} from './token_transfer'
import { DEFAULT_EOS_SYMBOL, DEFAULT_EOS_TOKEN_CONTRACT } from '../../eosConstants'

interface ValueTransferParams {
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  contractName?: EosEntityName
  amount: number
  symbol?: EosSymbol
  memo?: string
  permission: EosEntityName
}

// a value transfer for EOS just calls the standard transfer function
// if no contractName or tokenSymbol is provided, use the chain defauult (e.g. 'EOS')
export const composeAction = (params: ValueTransferParams) => {
  return tokenTransferComposeAction({
    ...params,
    contractName: params?.contractName ? params?.contractName : toEosEntityName(DEFAULT_EOS_TOKEN_CONTRACT),
    symbol: params?.symbol ? params?.symbol : toEosSymbol(DEFAULT_EOS_SYMBOL),
  })
}

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  return tokenTransferDecomposeAction(action)
}
