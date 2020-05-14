import { EosEntityName, EosAsset, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'retire'

interface tokenRetireParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const composeAction = ({ contractName, ownerAccountName, tokenAmount, memo, permission }: tokenRetireParams) => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: ownerAccountName,
      permission,
    },
  ],
  data: {
    quantity: tokenAmount,
    memo,
  },
})
export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === actionName && data?.quantity) {
    return {
      actionType: ChainActionType.TokenRetire,
      args: {
        ...data,
      },
    }
  }

  return null
}
