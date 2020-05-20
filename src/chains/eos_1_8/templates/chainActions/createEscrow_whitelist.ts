import { EosEntityName, EosActionStruct, DecomposeReturn, EosChainActionType } from '../../models'
import { getAuthorization, toEosEntityName } from '../../helpers'

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
}: createEscrowWhitelistParams): EosActionStruct => ({
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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.owner && data?.account && data?.dapp) {
    const auth = getAuthorization(authorization)
    const returnData: createEscrowWhitelistParams = {
      accountName: toEosEntityName(data.owner),
      appName: data.dapp,
      contractName: toEosEntityName(account),
      permission: toEosEntityName(auth.permission),
      whitelistAccount: data.accountName,
    }

    return {
      chainActionType: EosChainActionType.CreateEscrowWhitelist,
      args: { ...returnData },
    }
  }

  return null
}
