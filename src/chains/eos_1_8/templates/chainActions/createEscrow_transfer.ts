import { EosAsset, EosEntityName, EosActionStruct, DecomposeReturn, EosChainActionType } from '../../models'
import { ChainActionType } from '../../../../models'

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
  const { name, data } = action

  if (name === actionName && data?.from && data?.to && data?.quantity) {
    return {
      actionType: EosChainActionType.CreateEscrowTransfer,
      args: { ...data },
    }
  }

  return null
}
