import { EosAsset, EosEntityName, EosActionStruct, EosDecomposeReturn, EosChainActionType } from '../../../models'
import { getFirstAuthorizationIfOnlyOneExists, toEosEntityName, toEosEntityNameOrNull } from '../../../helpers'

const actionName: string = 'transfer'

interface CreateEscrowTransferParams {
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
}: CreateEscrowTransferParams): EosActionStruct => ({
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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<CreateEscrowTransferParams> = {
      accountName: toEosEntityName(data.from),
      amount: data.quantity,
      contractName: toEosEntityName(account),
      createEscrowAccountName: toEosEntityName(data.to),
      memo: data.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission
    return {
      chainActionType: EosChainActionType.CreateEscrowTransfer,
      args: returnData,
      partial,
    }
  }

  return null
}
