import { EosAuthorizationStruct, EosEntityName } from '../../models'

interface updateAuthParams {
  auth: EosAuthorizationStruct
  authAccount: EosEntityName
  authPermission: EosEntityName
  parent: EosEntityName
  permission: EosEntityName
}

export const action = ({ auth, authAccount, authPermission, parent, permission }: updateAuthParams) => ({
  account: 'eosio',
  name: 'updateauth',
  authorization: [
    {
      actor: authAccount,
      permission: authPermission,
    },
  ],
  data: {
    account: authAccount,
    permission,
    parent,
    auth,
  },
})
