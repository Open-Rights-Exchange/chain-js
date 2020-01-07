import { EosEntityName } from '../../models'

interface unlinkAuthParams {
  action: string
  authAccountName: EosEntityName
  authPermission: EosEntityName
  contract: EosEntityName
}

export const action = ({ action, authAccountName, authPermission, contract }: unlinkAuthParams) => ({
  account: 'eosio',
  name: 'unlinkauth',
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
  },
})
