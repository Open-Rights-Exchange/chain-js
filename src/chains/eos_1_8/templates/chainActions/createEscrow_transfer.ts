import { EosAsset, EosEntityName } from '../../models'

interface createEscrowTransferParams {
  accountName: EosEntityName
  amount: EosAsset
  contractName: EosEntityName
  createEscrowAccountName: EosEntityName
  memo: string
  permission: EosEntityName
}

export const action = ({
  accountName,
  amount,
  contractName,
  createEscrowAccountName,
  memo,
  permission,
}: createEscrowTransferParams) => ({
  account: contractName,
  name: 'transfer',
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
