import { EosEntityName, EosAsset } from '../../models'

interface tokenRetireParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const action = ({ contractName, ownerAccountName, tokenAmount, memo, permission }: tokenRetireParams) => ({
  account: contractName,
  name: 'retire',
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
