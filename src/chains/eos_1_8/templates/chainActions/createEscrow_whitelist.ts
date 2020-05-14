import { EosEntityName } from '../../models'

interface createEscrowWhitelistParams {
  accountName: EosEntityName
  appName: string
  contractName: EosEntityName
  permission: EosEntityName
  whitelistAccount: string
}

export const composeAction = ({
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

export const decomposeAction = (action: any) => {
}