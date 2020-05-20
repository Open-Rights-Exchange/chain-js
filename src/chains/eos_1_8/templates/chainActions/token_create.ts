import { EosEntityName, EosAsset, DecomposeReturn, EosActionStruct } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'create'

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
}: tokenCreateParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.issuer && data?.maximum_supply) {
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: tokenCreateParams = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      toAccountName: toEosEntityName(data.issuer),
      permission: toEosEntityNameOrNull(auth?.permission),
      tokenAmount: data.maximum_supply,
    }
    return {
      chainActionType: ChainActionType.TokenCreate,
      args: { ...returnData },
    }
  }

  return null
}
