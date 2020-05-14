import { EosEntityName, EosAsset } from '../../models'
import { ChainActionType } from '../../../../models'

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
}: tokenApproveParams) => ({
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

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    return {
      actionType: ChainActionType.TokenApprove,
      args: { ...data },
    }
  }

  return null
}
