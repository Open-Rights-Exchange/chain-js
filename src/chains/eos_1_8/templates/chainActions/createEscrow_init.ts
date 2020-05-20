import { EosEntityName, EosActionStruct, DecomposeReturn, EosChainActionType } from '../../models'

const actionName = 'init'

interface createEscrowInitParams {
  contractName: EosEntityName
  chainSymbol: string
  newAccountContract: EosEntityName
  newAccountAction: string
  minimumRAM: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  chainSymbol,
  newAccountContract,
  newAccountAction,
  minimumRAM,
  permission,
}: createEscrowInitParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: contractName,
      permission,
    },
  ],
  data: {
    symbol: chainSymbol,
    newaccountcontract: newAccountContract,
    newaccountaction: newAccountAction,
    minimumram: minimumRAM,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === actionName && data?.symbol && data?.newaccountcontract && data?.newaccountaction && data?.minimumram) {
    return {
      actionType: EosChainActionType.CreateEscrowInit,
      args: { ...data },
    }
  }

  return null
}
