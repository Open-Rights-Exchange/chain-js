import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosChainActionType } from '../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'reclaim'

interface createEscrowReclaimParams {
  accountName: EosEntityName
  appName: string
  contractName: EosEntityName
  permission: EosEntityName
  symbol: string
}

export const composeAction = ({ accountName, appName, contractName, permission, symbol }: createEscrowReclaimParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: accountName,
      permission,
    },
  ],
  data: {
    reclaimer: accountName,
    dapp: appName,
    sym: symbol,
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.reclaimer && data?.dapp && data?.sym) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<createEscrowReclaimParams> = {
      accountName: toEosEntityName(data.reclaimer),
      appName: data.dapp,
      contractName: toEosEntityName(account),
      permission: toEosEntityNameOrNull(auth?.permission),
      symbol: data.sym,
    }
    const partial = !returnData?.permission
    return {
      chainActionType: EosChainActionType.CreateEscrowReclaim,
      args: returnData,
      partial,
    }
  }

  return null
}
