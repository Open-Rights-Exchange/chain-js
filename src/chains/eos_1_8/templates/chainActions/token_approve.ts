import { EosEntityName, EosAsset, DecomposeReturn, EosActionStruct } from '../../models'
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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: tokenApproveParams = {
      contractName: toEosEntityName(account),
      memo: data.memo,
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      tokenAmount: data.quantity,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    return {
      chainActionType: ChainActionType.TokenApprove,
      args: { ...returnData },
    }
  }

  return null
}
