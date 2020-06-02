import { EosEntityName, EosAsset, EosActionStruct, EosDecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { getFirstAuthorizationIfOnlyOneExists, toEosEntityName, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'transferFrom'

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
}: tokenTransferFromParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.sender && data?.quantity) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<tokenTransferFromParams> = {
      contractName: toEosEntityName(account),
      approvedAccountName: toEosEntityName(data.sender),
      fromAccountName: toEosEntityName(data.from),
      toAccountName: toEosEntityName(data.to),
      tokenAmount: data.quantity,
      memo: data.memo,
      permission: toEosEntityNameOrNull(auth?.permission),
    }
    const partial = !returnData?.permission
    return {
      chainActionType: ChainActionType.TokenTransferFrom,
      args: returnData,
      partial,
    }
  }

  return null
}
