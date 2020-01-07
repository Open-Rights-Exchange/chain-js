import { EosEntityName } from '../../models'

interface deleteAuthParams {
  account: EosEntityName
  authAccountName: EosEntityName
  authPermission: EosEntityName
  permission: EosEntityName
}

export const action = ({ account, authAccountName, authPermission, permission }: deleteAuthParams) => ({
  account: 'eosio',
  name: 'deleteauth',
  authorization: [
    {
      actor: authAccountName,
      permission: authPermission,
    },
  ],
  data: {
    account,
    permission,
  },
})
