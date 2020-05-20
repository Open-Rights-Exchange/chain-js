import { EosEntityName, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'unlinkauth'

interface unlinkAuthParams {
  action: string
  authAccount: EosEntityName
  authPermission: EosEntityName
  contract: EosEntityName
}

export const composeAction = ({
  action,
  authAccount,
  authPermission,
  contract,
}: unlinkAuthParams): EosActionStruct => ({
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
    code: contract,
    type: action,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.code && data?.type) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)

    const returnData: unlinkAuthParams = {
      action: data.type,
      authAccount: toEosEntityName(data.account),
      authPermission: toEosEntityNameOrNull(auth?.permission),
      contract: toEosEntityName(data.code),
    }

    return {
      chainActionType: ChainActionType.AccountUnlinkAuth,
      args: { ...returnData },
    }
  }

  return null
}
