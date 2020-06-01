import { EosEntityName, EosDecomposeReturn, EosActionStruct, EosSymbol } from '../../models'
import { ChainActionType } from '../../../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
  toEosAsset,
  EosAssetHelper,
} from '../../helpers'

const actionName = 'approve'

interface TokenApproveParams {
  contractName: EosEntityName
  memo?: string
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  amount: number
  symbol: EosSymbol
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  memo,
  fromAccountName,
  toAccountName,
  amount,
  symbol,
  permission,
}: TokenApproveParams): EosActionStruct => ({
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
    quantity: toEosAsset(amount, symbol),
    memo: memo || '',
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const quantityAsset = new EosAssetHelper(data.quantity)
    const returnData: TokenApproveParams = {
      contractName: toEosEntityName(account),
      memo: data?.memo,
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      amount: quantityAsset.amount,
      symbol: quantityAsset.symbol,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission
    return {
      chainActionType: ChainActionType.TokenApprove,
      args: returnData,
      partial,
    }
  }

  return null
}
