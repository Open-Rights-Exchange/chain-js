import { EosEntityName, EosActionStruct, DecomposeReturn, EosSymbol } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosAsset, toEosEntityName } from '../../helpers'
import { DEFAULT_EOS_TOKEN_CONTRACT } from '../../eosConstants'

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
  contractName = toEosEntityName(DEFAULT_EOS_TOKEN_CONTRACT),
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
      chainActionType: ChainActionType.TokenTransfer,
      args: {
        ...data,
      },
    }
  }

  return null
}
