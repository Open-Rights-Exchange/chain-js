import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosSymbol } from '../../models'
import { ChainActionType } from '../../../../models'
import {
  toEosEntityName,
  toEosSymbol,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
} from '../../helpers'
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
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<valueTransferParams> = {
      contractName: toEosEntityName(account),
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      tokenAmount: data.quantity,
      memo: data.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission
    return {
      chainActionType: ChainActionType.ValueTransfer,
      args: returnData,
      partial,
    }
  }

  return null
}
