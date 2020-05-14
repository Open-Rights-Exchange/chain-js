import { EosEntityName, EosAsset } from '../../models'

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
  name: 'issue',
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
}