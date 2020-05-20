import { EosEntityName, EosActionStruct, DecomposeReturn, EosChainActionType } from '../../models'
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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.reclaimer && data?.dapp && data?.sym) {
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: createEscrowReclaimParams = {
      accountName: toEosEntityName(data.reclaimer),
      appName: data.dapp,
      contractName: toEosEntityName(account),
      permission: toEosEntityNameOrNull(auth?.permission),
      symbol: data.sym,
    }

    return {
      chainActionType: EosChainActionType.CreateEscrowReclaim,
      args: { ...returnData },
    }
  }

  return null
}
