import { EosAuthorizationStruct, EosEntityName, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getAuthorization } from '../../helpers'

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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.permission && data?.parent && data?.auth) {
    const auth = getAuthorization(authorization)
    const returnData: updateAuthParams = {
      auth: data.auth,
      authAccount: toEosEntityName(data.authAccount),
      authPermission: toEosEntityName(auth.permission),
      parent: toEosEntityName(data.parent),
      permission: toEosEntityName(auth.permission),
    }
    return {
      chainActionType: ChainActionType.AccountUpdateAuth,
      args: { ...returnData },
    }
  }

  return null
}
