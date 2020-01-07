import { EosEntityName } from '../../models'

interface oreUpsertRightParams {
  contractName: EosEntityName
  issuerWhitelist: string
  oreAccountName: EosEntityName
  rightName: string
  urls: string
}

export const action = ({ contractName, issuerWhitelist, oreAccountName, rightName, urls }: oreUpsertRightParams) => ({
  account: contractName,
  name: 'upsertright',
  authorization: [
    {
      actor: oreAccountName,
      permission: 'active',
    },
  ],
  data: {
    issuer: oreAccountName,
    right_name: rightName,
    urls,
    issuer_whitelist: issuerWhitelist,
  },
})
