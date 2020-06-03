import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosSymbol } from '../../../models'
import { ChainActionType } from '../../../../../models'
import {
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityName,
  toEosEntityNameOrNull,
  toEosAsset,
  EosAssetHelper,
} from '../../../helpers'

const actionName = 'transferFrom'

interface TokenTransferFromParams {
  approvedAccountName: EosEntityName
  contractName: EosEntityName
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  amount: number
  symbol: EosSymbol
  memo?: string
  permission: EosEntityName
}

export const composeAction = ({
  approvedAccountName,
  contractName,
  fromAccountName,
  toAccountName,
  amount,
  symbol,
  memo,
  permission,
}: TokenTransferFromParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: approvedAccountName,
      permission,
    },
  ],
  data: {
    sender: approvedAccountName,
    from: fromAccountName,
    to: toAccountName,
    quantity: toEosAsset(amount, symbol),
    memo: memo || '',
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.sender && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const quantityAsset = new EosAssetHelper(data.quantity)
    const returnData: Partial<TokenTransferFromParams> = {
      contractName: toEosEntityName(account),
      approvedAccountName: toEosEntityName(data.sender),
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      amount: quantityAsset.amount,
      symbol: quantityAsset.symbol,
      memo: data?.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission
    return {
      chainActionType: ChainActionType.TokenTransferFrom,
      args: returnData,
      partial,
    }
  }

  return null
}
