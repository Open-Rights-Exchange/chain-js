import { EosAsset, EosEntityName, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { getAuthorization, toEosEntityName } from '../../helpers'

const actionName = 'transfer'

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
    quantity: tokenAmount,
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to) {
    const auth = getAuthorization(authorization)
    const returnData: tokenTransferParams = {
      contractName: toEosEntityName(account),
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      tokenAmount: data.quantity,
      memo: data.memo,
      permission: toEosEntityName(auth.permission),
    }
    return {
      chainActionType: ChainActionType.TokenTransfer,
      args: { ...returnData },
    }
  }

  return null
}
