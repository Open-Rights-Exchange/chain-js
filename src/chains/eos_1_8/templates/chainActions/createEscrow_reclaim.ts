import { EosEntityName, EosActionStruct, DecomposeReturn, EosChainActionType } from '../../models'

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
  const { name, data } = action

  if (name === actionName && data?.reclaimer && data?.dapp && data?.sym) {
    return {
      actionType: EosChainActionType.CreateEscrowReclaim,
      args: { ...data },
    }
  }

  return null
}
