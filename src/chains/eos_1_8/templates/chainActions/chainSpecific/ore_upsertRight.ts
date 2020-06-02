import { EosEntityName, EosDecomposeReturn, EosActionStruct, EosChainActionType } from '../../../models'
import { toEosEntityName } from '../../../helpers'

const actionName = 'upsertright'

interface OreUpsertRightParams {
  contractName: EosEntityName
  issuerWhitelist: string
  oreAccountName: EosEntityName
  rightName: string
  urls: string
}

export const composeAction = ({
  contractName,
  issuerWhitelist,
  oreAccountName,
  rightName,
  urls,
}: OreUpsertRightParams): EosActionStruct => ({
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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account } = action

  if (name === actionName && data?.issuer && data?.right_name && data?.issuer_whitelist) {
    const returnData: OreUpsertRightParams = {
      contractName: toEosEntityName(account),
      issuerWhitelist: toEosEntityName(data.issuer_whitelist),
      oreAccountName: toEosEntityName(data.issuer),
      rightName: toEosEntityName(data.right_name),
      urls: data.urls,
    }

    return {
      chainActionType: EosChainActionType.OreUpsertRight,
      args: returnData,
    }
  }

  return null
}
