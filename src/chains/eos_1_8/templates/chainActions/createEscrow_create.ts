import { EosEntityName, EosPublicKey } from '../../models'

interface createEscrowCreateParams {
  accountName: EosEntityName
  contractName: EosEntityName
  appName: string
  payerAccountName: EosEntityName
  payerAccountPermissionName: EosEntityName
  publicKeyActive: EosPublicKey
  publicKeyOwner: EosPublicKey
  pricekey: string
  referralAccountName: EosEntityName
}

export const action = ({
  accountName,
  contractName,
  appName,
  payerAccountName,
  payerAccountPermissionName,
  publicKeyActive,
  publicKeyOwner,
  pricekey,
  referralAccountName,
}: createEscrowCreateParams) => ({
  account: contractName,
  name: 'create',
  authorization: [
    {
      actor: payerAccountName,
      permission: payerAccountPermissionName,
    },
  ],
  data: {
    memo: payerAccountName,
    account: accountName,
    ownerkey: publicKeyOwner,
    activekey: publicKeyActive,
    origin: appName,
    referral: referralAccountName || '',
  },
})
