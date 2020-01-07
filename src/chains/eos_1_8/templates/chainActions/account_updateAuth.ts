import { EosAuthorizationStruct, EosEntityName, Authorization } from '../../models'

interface updateAuthParams {
  auth: EosAuthorizationStruct
  authAccountName: EosEntityName
  authPermission: EosEntityName
  parent: EosEntityName
  permission: EosEntityName
}

export const action = ({ auth, authAccountName, authPermission, parent, permission }: updateAuthParams) => ({
  account: 'eosio',
  name: 'updateauth',
  authorization: [
    {
      actor: authAccountName,
      permission: authPermission,
    },
  ],
  data: {
    account: authAccountName,
    permission,
    parent,
    auth,
  },
})
