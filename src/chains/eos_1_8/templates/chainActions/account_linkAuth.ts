/* eslint-disable no-shadow */
import { EosEntityName } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'linkauth'

interface linkAuthParams {
  action: string
  authAccount: EosEntityName
  authPermission: EosEntityName
  contract: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({ action, authAccount, authPermission, contract, permission }: linkAuthParams) => ({
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
    code: contract,
    type: action,
    requirement: permission,
  },
})

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.account && data?.code && data?.type && data?.requirement) {
    return {
      actionType: ChainActionType.AccountLinkAuth,
      args: { ...data },
    }
  }

  return null
}
