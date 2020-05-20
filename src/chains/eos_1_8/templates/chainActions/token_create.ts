import { EosEntityName, EosAsset, DecomposeReturn, EosActionStruct } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'create'

interface tokenCreateParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  ownerAccountName,
  toAccountName,
  tokenAmount,
  permission,
}: tokenCreateParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: ownerAccountName,
      permission,
    },
  ],
  data: {
    issuer: toAccountName,
    maximum_supply: tokenAmount,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === actionName && data?.issuer && data?.maximum_supply) {
    return {
      actionType: ChainActionType.TokenCreate,
      args: { ...data },
    }
  }

  return null
}
