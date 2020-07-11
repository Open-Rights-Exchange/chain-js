import { EosEntityName, EosActionStruct, EosDecomposeReturn } from '../../../models'
import { ChainActionType } from '../../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../../helpers'

const actionName = 'unlinkauth'

export interface UnlinkAuthParams {
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
}: UnlinkAuthParams): EosActionStruct => ({
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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.code && data?.type) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<UnlinkAuthParams> = {
      action: data.type,
      authAccount: toEosEntityName(data.account),
      authPermission: toEosEntityNameOrNull(auth?.permission),
      contract: toEosEntityName(data.code),
    }
    const partial = !returnData?.authPermission
    return {
      chainActionType: ChainActionType.AccountUnlinkAuth,
      args: returnData,
      partial,
    }
  }

  return null
}
