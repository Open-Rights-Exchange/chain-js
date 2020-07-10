/* eslint-disable no-shadow */
import { EosEntityName, EosActionStruct, EosDecomposeReturn } from '../../../models'
import { ChainActionType } from '../../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../../helpers'

const actionName = 'linkauth'

export interface LinkAuthParams {
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
}: LinkAuthParams): EosActionStruct => ({
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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.code && data?.type && data?.requirement) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)

    const returnData: Partial<LinkAuthParams> = {
      action: data.type,
      authAccount: toEosEntityName(data.account),
      authPermission: toEosEntityNameOrNull(auth?.permission),
      contract: toEosEntityName(data?.code),
      permission: toEosEntityName(data?.requirement),
    }
    const partial = !returnData?.permission

    return {
      chainActionType: ChainActionType.AccountLinkAuth,
      args: returnData,
      partial,
    }
  }

  return null
}
