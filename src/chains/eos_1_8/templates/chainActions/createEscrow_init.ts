import { EosEntityName, EosActionStruct, EosDecomposeReturn, EosChainActionType } from '../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.symbol && data?.newaccountcontract && data?.newaccountaction && data?.minimumram) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: createEscrowInitParams = {
      contractName: toEosEntityName(account),
      chainSymbol: data.symbol,
      newAccountContract: toEosEntityName(data.newaccountcontract),
      newAccountAction: data.newaccountaction,
      minimumRAM: data.minimumram,
      permission: toEosEntityNameOrNull(auth?.permission),
    }

    return {
      chainActionType: EosChainActionType.CreateEscrowInit,
      args: { ...returnData },
    }
  }

  return null
}
