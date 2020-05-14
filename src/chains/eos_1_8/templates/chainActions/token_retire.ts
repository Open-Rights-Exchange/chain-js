import { EosEntityName, EosAsset, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'

interface tokenRetireParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const composeAction = ({ contractName, ownerAccountName, tokenAmount, memo, permission }: tokenRetireParams) => ({
  account: contractName,
  name: 'retire',
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

  if (name === 'retire' && data?.quantity) {
    return {
      actionType: ChainActionType.TokenRetire,
      args: {
        ...data,
      },
    }
  }

  return null
}
