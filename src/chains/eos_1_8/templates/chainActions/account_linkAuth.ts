/* eslint-disable no-shadow */
import { EosEntityName } from '../../models'

interface linkAuthParams {
  action: string
  authAccountName: EosEntityName
  authPermission: EosEntityName
  contract: EosEntityName
  permission: EosEntityName
}

export const action = ({ action, authAccountName, authPermission, contract, permission }: linkAuthParams) => ({
  account: 'eosio',
  name: 'linkauth',
  authorization: [
    {
      actor: authAccountName,
      permission: authPermission,
    },
  ],
  data: {
    account: authAccountName,
    code: contract,
    type: action,
    requirement: permission,
  },
})
