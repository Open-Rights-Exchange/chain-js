import { EosEntityName, EosActionStruct } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName } from '../../helpers'

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

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.account && data?.code && data?.type) {
    return {
      actionType: ChainActionType.AccountUnlinkAuth,
      args: { ...data },
    }
  }

  return null
}
