import { EosEntityName, EosAsset } from '../../models'

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
  name: 'approve',
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
}