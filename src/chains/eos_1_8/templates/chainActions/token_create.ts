import { EosEntityName, EosAsset } from '../../models'

interface tokenCreateParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  ownerAccountName,
  toAccountName,
  tokenAmount,
  permission,
}: tokenCreateParams) => ({
  account: contractName,
  name: 'create',
  authorization: [
    {
      actor: ownerAccountName,
      permission,
    },
  ],
  data: {
    issuer: toAccountName,
    maximum_supply: tokenAmount,
  },
})

export const decomposeAction = (action: any) => {
}