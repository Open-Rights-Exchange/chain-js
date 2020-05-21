import { EosEntityName, EosAsset, EosActionStruct, EosDecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'retire'

interface tokenRetireParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const composeAction = ({ contractName, ownerAccountName, tokenAmount, memo, permission }: tokenRetireParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: ownerAccountName,
      permission,
    },
  ],
  data: {
    quantity: tokenAmount,
    memo,
  },
})
export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: tokenRetireParams = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      tokenAmount: data.quantity,
      memo: data.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    return {
      chainActionType: ChainActionType.TokenRetire,
      args: { ...returnData },
    }
  }

  return null
}
