import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosSymbol, EosChainActionType } from '../../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
  toEosAsset,
  EosAssetHelper,
} from '../../../helpers'

const actionName = 'retire'

export interface TokenRetireParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  amount: string
  symbol: EosSymbol
  memo?: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  ownerAccountName,
  amount,
  symbol,
  memo,
  permission,
}: TokenRetireParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: ownerAccountName,
      permission,
    },
  ],
  data: {
    quantity: toEosAsset(amount, symbol),
    memo: memo || '',
  },
})
export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const quantityAsset = new EosAssetHelper(null, null, data.quantity)
    const returnData: TokenRetireParams = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      amount: quantityAsset.amount,
      symbol: quantityAsset.symbol,
      memo: data?.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission || !returnData?.ownerAccountName
    return {
      chainActionType: EosChainActionType.EosTokenRetire,
      args: returnData,
      partial,
    }
  }

  return null
}
