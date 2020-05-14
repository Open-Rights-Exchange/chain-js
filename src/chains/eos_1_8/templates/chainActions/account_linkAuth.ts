/* eslint-disable no-shadow */
import { EosEntityName } from '../../models'

interface linkAuthParams {
  action: string
  authAccount: EosEntityName
  authPermission: EosEntityName
  contract: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({ action, authAccount, authPermission, contract, permission }: linkAuthParams) => ({
  account: 'eosio',
  name: 'linkauth',
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
}