import { EosEntityName, EosAsset, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'issue'

interface tokenIssueParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  ownerAccountName,
  toAccountName,
  tokenAmount,
  memo,
  permission,
}: tokenIssueParams): EosActionStruct => ({
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
    quantity: tokenAmount,
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.to && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: tokenIssueParams = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      toAccountName: data.to,
      tokenAmount: data.quantity,
      memo: data.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }

    return {
      chainActionType: ChainActionType.TokenIssue,
      args: { ...returnData },
    }
  }

  return null
}
