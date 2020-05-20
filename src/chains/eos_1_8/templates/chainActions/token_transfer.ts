import { EosEntityName, EosActionStruct, DecomposeReturn, EosSymbol } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosAsset, toEosEntityName, toEosSymbol } from '../../helpers'
import { DEFAULT_EOS_TOKEN_CONTRACT, DEFAULT_EOS_SYMBOL } from '../../eosConstants'

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
  tokenSymbol = toEosSymbol(DEFAULT_EOS_SYMBOL),
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
