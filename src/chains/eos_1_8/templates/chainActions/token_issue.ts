import { EosEntityName, EosAsset } from '../../models'
import { ChainActionType } from '../../../../models'

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
}: tokenIssueParams) => ({
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

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.to && data?.quantity) {
    return {
      actionType: ChainActionType.TokenIssue,
      args: { ...data },
    }
  }

  return null
}
