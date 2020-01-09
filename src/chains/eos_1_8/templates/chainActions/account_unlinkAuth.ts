import { EosEntityName } from '../../models'

interface unlinkAuthParams {
  action: string
  authAccount: EosEntityName
  authPermission: EosEntityName
  contract: EosEntityName
}

export const action = ({ action, authAccount, authPermission, contract }: unlinkAuthParams) => ({
  account: 'eosio',
  name: 'unlinkauth',
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
