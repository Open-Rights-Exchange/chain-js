import { EosEntityName, EosActionStruct, DecomposeReturn, EosSymbol } from '../../models'
import { ChainActionType } from '../../../../models'
import { getFirstAuthorizationIfOnlyOneExists, toEosEntityName, toEosEntityNameOrNull } from '../../helpers'
import { DEFAULT_EOS_TOKEN_CONTRACT } from '../../eosConstants'

const actionName = 'transfer'
interface tokenTransferParams {
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  contractName: EosEntityName
  tokenAmount: number
  tokenSymbol: EosSymbol
  memo: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName = toEosEntityName(DEFAULT_EOS_TOKEN_CONTRACT),
  fromAccountName,
  toAccountName,
  tokenAmount,
  tokenSymbol,
  memo,
  permission,
}: tokenTransferParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: fromAccountName,
      permission,
    },
  ],
  data: {
    from: fromAccountName,
    to: toAccountName,
    quantity: toEosAsset(tokenAmount, tokenSymbol),
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<tokenTransferParams> = {
      contractName: toEosEntityName(account),
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      tokenAmount: data.quantity,
      memo: data.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    return {
      chainActionType: ChainActionType.TokenTransfer,
      args: { ...returnData },
    }
  }

  return null
}
