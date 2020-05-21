import { EosEntityName, EosAsset, EosDecomposeReturn, EosActionStruct } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'approve'

interface tokenApproveParams {
  contractName: EosEntityName
  memo: string
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  memo,
  fromAccountName,
  toAccountName,
  tokenAmount,
  permission,
}: tokenApproveParams): EosActionStruct => ({
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
    quantity: tokenAmount,
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<tokenApproveParams> = {
      contractName: toEosEntityName(account),
      memo: data.memo,
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      tokenAmount: data.quantity,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !auth?.permission
    return {
      chainActionType: ChainActionType.TokenApprove,
      args: { ...returnData },
      partial,
    }
  }

  return null
}
