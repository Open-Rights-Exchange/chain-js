import { EosAsset, EosEntityName, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'

interface tokenTransferParams {
  contractName: EosEntityName
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  tokenAmount: EosAsset
  memo: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  fromAccountName,
  toAccountName,
  tokenAmount,
  memo,
  permission,
}: tokenTransferParams) => ({
  account: contractName,
  name: 'transfer',
  authorization: [
    {
      actor: fromAccountName,
      permission,
    },
  ],
  data: {
    from: fromAccountName,
    to: toAccountName,
    quantity: tokenAmount,
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === 'transfer' && data?.from && data?.to) {
    return {
      actionType: ChainActionType.TokenTransfer,
      args: {
        ...data,
      },
    }
  }

  return null
}
