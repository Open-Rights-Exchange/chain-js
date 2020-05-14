import { EosAuthorizationStruct, EosEntityName } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'updateauth'

interface updateAuthParams {
  auth: EosAuthorizationStruct
  authAccount: EosEntityName
  authPermission: EosEntityName
  parent: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({ auth, authAccount, authPermission, parent, permission }: updateAuthParams) => ({
  account: 'eosio',
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

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.account && data?.permission && data?.parent && data?.auth) {
    return {
      actionType: ChainActionType.AccountUpdateAuth,
      args: { ...data },
    }
  }

  return null
}
