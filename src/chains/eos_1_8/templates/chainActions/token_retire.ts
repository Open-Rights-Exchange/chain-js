import { EosEntityName, EosAsset, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrEmptyString, toEosEntityNameOrNull } from '../../helpers'

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
export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.quantity) {
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
