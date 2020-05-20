/* eslint-disable no-shadow */
import { EosEntityName, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'linkauth'

interface linkAuthParams {
  action: string
  authAccount: EosEntityName
  authPermission: EosEntityName
  contract: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({
  action,
  authAccount,
  authPermission,
  contract,
  permission,
}: linkAuthParams): EosActionStruct => ({
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
    requirement: permission,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.code && data?.type && data?.requirement) {
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)

    const returnData: linkAuthParams = {
      action: data?.action,
      authAccount: toEosEntityName(data.account),
      authPermission: toEosEntityNameOrNull(auth?.permission),
      contract: toEosEntityName(data?.code),
      permission: toEosEntityName(data?.requirement),
    }
    return {
      chainActionType: ChainActionType.AccountLinkAuth,
      args: { ...returnData },
    }
  }

  return null
}
