import { EosEntityName, EosAsset, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'

interface tokenTransferFromParams {
  approvedAccountName: EosEntityName
  contractName: EosEntityName
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const composeAction = ({
  approvedAccountName,
  contractName,
  fromAccountName,
  toAccountName,
  tokenAmount,
  memo,
  permission,
}: tokenTransferFromParams) => ({
  account: contractName,
  name: 'transferFrom',
  authorization: [
    {
      actor: approvedAccountName,
      permission,
    },
  ],
  data: {
    sender: approvedAccountName,
    from: fromAccountName,
    to: toAccountName,
    quantity: tokenAmount,
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === 'transferFrom' && data?.from && data?.to && data?.sender) {
    return {
      actionType: ChainActionType.TokenTransferFrom,
      args: {
        ...data,
      },
    }
  }

  return null
}
