import { EosEntityName, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName } from '../../helpers'

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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.permission) {
    const [firstAuthorization] = authorization
    const returnData: deleteAuthParams = {
      account: toEosEntityName(data.account),
      authAccount: toEosEntityName(firstAuthorization.actor),
      authPermission: toEosEntityName(firstAuthorization.permission),
      permission: toEosEntityName(data.permission),
    }
    return {
      chainActionType: ChainActionType.AccountDeleteAuth,
      args: returnData,
    }
  }

  return null
}
