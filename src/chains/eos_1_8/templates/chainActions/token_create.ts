import { EosEntityName, EosAsset } from '../../models'

interface tokenCreateParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  permission: EosEntityName
}

export const action = ({
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
