import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosSymbol } from '../../../models'
import { ChainActionType } from '../../../../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
  toEosAsset,
  EosAssetHelper,
} from '../../../helpers'

const actionName = 'issue'

interface TokenIssueParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  toAccountName: EosEntityName
  // todo: change calling code to send amount and symbol
  amount: number
  symbol: EosSymbol
  memo?: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  ownerAccountName,
  toAccountName,
  amount,
  symbol,
  memo,
  permission,
}: TokenIssueParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: ownerAccountName,
      permission,
    },
  ],
  data: {
    to: toAccountName,
    quantity: toEosAsset(amount, symbol),
    memo: memo || '',
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.to && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const quantityAsset = new EosAssetHelper(null, null, data.quantity)
    const returnData: TokenIssueParams = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      toAccountName: data.to,
      amount: quantityAsset.amount,
      symbol: quantityAsset.symbol,
      memo: data?.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission || !returnData?.ownerAccountName
    return {
      chainActionType: ChainActionType.TokenIssue,
      args: returnData,
      partial,
    }
  }

  return null
}
