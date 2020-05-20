import { EosAuthorizationStruct, EosEntityName, EosActionStruct, EosDecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'updateauth'

interface updateAuthParams {
  auth: EosAuthorizationStruct
  authAccount: EosEntityName
  authPermission: EosEntityName
  parent: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({ auth, authAccount, authPermission, parent, permission }: updateAuthParams): EosActionStruct => ({
  account: toEosEntityName('eosio'),
  name: actionName,
  authorization: [
    {
      actor: authAccount,
      permission: authPermission,
    },
  ],
  data: {
    account: authAccount,
    permission,
    parent,
    auth,
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.permission && data?.parent && data?.auth) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: updateAuthParams = {
      auth: data.auth,
      authAccount: toEosEntityName(data.authAccount),
      authPermission: toEosEntityNameOrNull(auth?.permission),
      parent: toEosEntityName(data.parent),
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    return {
      chainActionType: ChainActionType.AccountUpdateAuth,
      args: { ...returnData },
    }
  }

  return null
}
