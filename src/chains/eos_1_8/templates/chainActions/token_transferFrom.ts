import { EosEntityName, EosAsset, EosActionStruct, DecomposeReturn } from '../../models'
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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.from && data?.to && data?.sender && data?.quantity) {
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
    return {
      chainActionType: ChainActionType.TokenTransferFrom,
      args: {
        ...returnData,
      },
    }
  }

  return null
}
