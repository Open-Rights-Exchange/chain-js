import { EosEntityName } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName: string = 'whitelist'

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
  name: actionName,
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
  const { name, data } = action

  if (name === actionName && data?.owner && data?.account && data?.dapp) {
    return {
      actionType: ChainActionType.CreateEscrowWhitelist,
      args: { ...data },
    }
  }

  return null
}
