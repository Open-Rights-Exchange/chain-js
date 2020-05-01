import { EosAsset, EosEntityName } from '../../models'
import { EosChainActionType } from '../../eosCompose'

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

export const decomposeAction = (action : any ): { actionType: EosChainActionType; args: any } => {
  if(action.name = 'transfer' && data.from && data.to) {
      return {
        actionType: EosChainActionType.TokenTransfer 
        args: {
          from: fromAccountName,
          to: toAccountName,
          quantity: tokenAmount,
          memo,
        }
      }
  }
  return {null, null}
}
