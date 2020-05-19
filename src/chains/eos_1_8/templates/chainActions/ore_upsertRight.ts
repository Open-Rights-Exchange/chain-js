import { EosEntityName, DecomposeReturn, EosActionStruct, EosChainActionType } from '../../models'
import { toEosEntityName } from '../../helpers'

const actionName = 'upsertright'

interface oreUpsertRightParams {
  contractName: EosEntityName
  issuerWhitelist: string
  oreAccountName: EosEntityName
  rightName: string
  urls: string
}

export const composeAction = ({ contractName, issuerWhitelist, oreAccountName, rightName, urls }: oreUpsertRightParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: oreAccountName,
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    issuer: oreAccountName,
    right_name: rightName,
    urls,
    issuer_whitelist: issuerWhitelist,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === actionName && data?.issuer && data?.right_name && data?.issuer_whitelist) {
    return {
      actionType: EosChainActionType.OreUpsertRight,
      args: { ...data },
    }
  }

  return null
}
