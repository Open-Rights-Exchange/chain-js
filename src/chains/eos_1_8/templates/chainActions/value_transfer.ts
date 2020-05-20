import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosSymbol } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, toEosSymbol } from '../../helpers'
import { composeAction as tokenTransferComposeAction } from './token_transfer'
import { DEFAULT_EOS_SYMBOL, DEFAULT_EOS_TOKEN_CONTRACT } from '../../eosConstants'

const actionName = 'transfer'

interface valueTransferParams {
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  contractName?: EosEntityName
  tokenAmount: number
  tokenSymbol?: EosSymbol
  memo?: string
  permission: EosEntityName
}

export const composeAction = ({
  fromAccountName,
  toAccountName,
  contractName = toEosEntityName(DEFAULT_EOS_TOKEN_CONTRACT),
  tokenAmount,
  tokenSymbol = toEosSymbol(DEFAULT_EOS_SYMBOL),
  memo,
  permission,
}: valueTransferParams) =>
  tokenTransferComposeAction({
    fromAccountName,
    toAccountName,
    contractName,
    tokenAmount,
    tokenSymbol,
    memo,
    permission,
  })

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    return {
      chainActionType: ChainActionType.ValueTransfer,
      args: {
        ...data,
      },
    }
  }

  return null
}
