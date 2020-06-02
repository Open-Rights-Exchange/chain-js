import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosChainActionType } from '../../models'
import { getFirstAuthorizationIfOnlyOneExists, toEosEntityName, toEosEntityNameOrNull } from '../../helpers'

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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.owner && data?.account && data?.dapp) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<createEscrowWhitelistParams> = {
      accountName: toEosEntityName(data.owner),
      appName: data.dapp,
      contractName: toEosEntityName(account),
      permission: toEosEntityNameOrNull(auth?.permission),
      whitelistAccount: data.accountName,
    }
    const partial = !returnData?.permission
    return {
      chainActionType: EosChainActionType.CreateEscrowWhitelist,
      args: returnData,
      partial,
    }
  }

  return null
}
