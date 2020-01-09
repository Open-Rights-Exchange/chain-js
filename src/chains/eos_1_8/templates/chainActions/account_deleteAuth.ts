import { EosEntityName } from '../../models'

interface deleteAuthParams {
  account: EosEntityName
  authAccount: EosEntityName
  authPermission: EosEntityName
  permission: EosEntityName
}

export const action = ({ account, authAccount, authPermission, permission }: deleteAuthParams) => ({
  account: 'eosio',
  name: 'deleteauth',
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
