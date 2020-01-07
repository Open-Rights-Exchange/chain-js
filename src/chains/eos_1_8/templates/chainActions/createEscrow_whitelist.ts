import { EosEntityName } from '../../models'

interface createEscrowWhitelistParams {
  accountName: EosEntityName
  appName: string
  contractName: EosEntityName
  permission: EosEntityName
  whitelistAccount: string
}

export const action = ({
  accountName,
  appName,
  contractName,
  permission,
  whitelistAccount,
}: createEscrowWhitelistParams) => ({
  account: contractName,
  name: 'whitelist',
  authorization: [
    {
      actor: accountName,
      permission,
    },
  ],
  data: {
    owner: accountName,
    account: whitelistAccount,
    dapp: appName,
  },
})
