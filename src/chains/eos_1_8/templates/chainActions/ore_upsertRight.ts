import { EosEntityName } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'upsertright'

interface oreUpsertRightParams {
  contractName: EosEntityName
  issuerWhitelist: string
  oreAccountName: EosEntityName
  rightName: string
  urls: string
}

export const composeAction = ({ contractName, issuerWhitelist, oreAccountName, rightName, urls }: oreUpsertRightParams) => ({
  account: contractName,
  name: actionName,
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

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.issuer && data?.right_name && data?.issuer_whitelist) {
    return {
      actionType: ChainActionType.OreUpsertRight,
      args: { ...data },
    }
  }

  return null
}
