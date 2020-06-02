import { EosEntityName, EosAsset, EosDecomposeReturn, EosActionStruct } from '../../models'
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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.issuer && data?.maximum_supply) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<tokenCreateParams> = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      toAccountName: toEosEntityName(data.issuer),
      permission: toEosEntityNameOrNull(auth?.permission),
      tokenAmount: data.maximum_supply,
    }
    const partial = !returnData?.permission || !returnData?.ownerAccountName
    return {
      chainActionType: ChainActionType.TokenCreate,
      args: returnData,
      partial,
    }
  }

  return null
}
