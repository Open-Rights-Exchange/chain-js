import { EosEntityName, EosAsset } from '../../models'

interface tokenTransferFromParams {
  approvedAccountName: EosEntityName
  contractName: EosEntityName
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const action = ({
  approvedAccountName,
  contractName,
  fromAccountName,
  toAccountName,
  tokenAmount,
  memo,
  permission,
}: tokenTransferFromParams) => ({
  account: contractName,
  name: 'transferFrom',
  authorization: [
    {
      actor: approvedAccountName,
      permission,
    },
  ],
  data: {
    sender: approvedAccountName,
    from: fromAccountName,
    to: toAccountName,
    quantity: tokenAmount,
    memo,
  },
})
