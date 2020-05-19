import { EosAuthorizationStruct, EosEntityName, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName } from '../../helpers'

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
  const { name, data } = action

  if (name === actionName && data?.account && data?.permission && data?.parent && data?.auth) {
    return {
      actionType: ChainActionType.AccountUpdateAuth,
      args: { ...data },
    }
  }

  return null
}
