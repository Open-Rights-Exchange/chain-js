import { EosAsset, EosEntityName, EosActionStruct, DecomposeReturn, EosChainActionType } from '../../models'
import { getAuthorization, toEosEntityName } from '../../helpers'

const actionName: string = 'transfer'

interface createEscrowTransferParams {
  accountName: EosEntityName
  amount: EosAsset
  contractName: EosEntityName
  createEscrowAccountName: EosEntityName
  memo: string
  permission: EosEntityName
}

export const composeAction = ({
  accountName,
  amount,
  contractName,
  createEscrowAccountName,
  memo,
  permission,
}: createEscrowTransferParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: accountName,
      permission,
    },
  ],
  data: {
    from: accountName,
    to: createEscrowAccountName,
    quantity: amount,
    memo,
  },
})

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    const auth = getAuthorization(authorization)
    const returnData: createEscrowTransferParams = {
      accountName: toEosEntityName(data.from),
      amount: data.quantity,
      contractName: toEosEntityName(account),
      createEscrowAccountName: toEosEntityName(data.to),
      memo: data.memo,
      permission: toEosEntityName(auth.permission),
    }
    return {
      chainActionType: EosChainActionType.CreateEscrowTransfer,
      args: { ...returnData },
    }
  }

  return null
}
