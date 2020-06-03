import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosSymbol } from '../../../models'
import { ChainActionType } from '../../../../../models'
import {
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityName,
  toEosEntityNameOrNull,
  toEosAsset,
  EosAssetHelper,
} from '../../../helpers'
import { DEFAULT_EOS_TOKEN_CONTRACT } from '../../../eosConstants'

const actionName = 'transfer'
interface TokenTransferParams {
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  contractName: EosEntityName
  amount: number
  symbol: EosSymbol
  memo?: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName = toEosEntityName(DEFAULT_EOS_TOKEN_CONTRACT),
  fromAccountName,
  toAccountName,
  amount,
  symbol,
  memo,
  permission,
}: TokenTransferParams): EosActionStruct => ({
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

  if (name === actionName && data?.from && data?.to) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const quantityAsset = new EosAssetHelper(data.quantity)
    const returnData: TokenTransferParams = {
      contractName: toEosEntityName(account),
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      amount: quantityAsset.amount,
      symbol: quantityAsset.symbol,
      memo: data?.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission
    return {
      chainActionType: ChainActionType.TokenTransfer,
      args: returnData,
      partial,
    }
  }

  return null
}
