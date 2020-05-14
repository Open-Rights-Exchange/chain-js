import { EosEntityName } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'deleteauth'

interface deleteAuthParams {
  account: EosEntityName
  authAccount: EosEntityName
  authPermission: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({ account, authAccount, authPermission, permission }: deleteAuthParams) => ({
  account: 'eosio',
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

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.account && data?.permission) {
    return {
      actionType: ChainActionType.AccountDeleteAuth,
      args: { ...data },
    }
  }

  return null
}
