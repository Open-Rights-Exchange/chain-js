import { EosEntityName, EosActionStruct, EosDecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'deleteauth'

interface deleteAuthParams {
  account: EosEntityName
  authAccount: EosEntityName
  authPermission: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({
  account,
  authAccount,
  authPermission,
  permission,
}: deleteAuthParams): EosActionStruct => ({
  account: toEosEntityName('eosio'),
  name: actionName,
  authorization: [
    {
      actor: authAccount,
      permission: authPermission,
    },
  ],
  data: {
    account,
    permission,
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.permission) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: deleteAuthParams = {
      account: toEosEntityName(data.account),
      authAccount: toEosEntityNameOrNull(auth?.actor),
      authPermission: toEosEntityNameOrNull(auth?.permission),
      permission: toEosEntityName(data.permission),
    }
    const partial = !returnData?.authPermission || !returnData?.authAccount

    return {
      chainActionType: ChainActionType.AccountDeleteAuth,
      args: returnData,
      partial,
    }
  }

  return null
}
