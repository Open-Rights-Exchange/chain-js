import { EosEntityName, EosActionStruct, DecomposeReturn, EosSymbol } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosAsset } from '../../helpers'

const actionName = 'transfer'
interface tokenTransferParams {
  fromAccountName: EosEntityName
  toAccountName: EosEntityName
  contractName: EosEntityName
  tokenAmount: number
  tokenSymbol: EosSymbol
  memo: string
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  fromAccountName,
  toAccountName,
  tokenAmount,
  tokenSymbol,
  memo,
  permission,
}: tokenTransferParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: fromAccountName,
      permission,
    },
  ],
  data: {
    from: fromAccountName,
    to: toAccountName,
    quantity: toEosAsset(tokenAmount, tokenSymbol),
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    return {
      actionType: ChainActionType.TokenTransfer,
      args: {
        ...data,
      },
    }
  }

  return null
}
