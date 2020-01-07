import { EosEntityName, EosPublicKey } from '../../models'

interface oreCreateAccountParams {
  accountName: EosEntityName
  payerAccountName: EosEntityName
  payerAccountPermissionName: EosEntityName
  publicKeyActive: EosPublicKey
  publicKeyOwner: EosPublicKey
  pricekey: string
  referralAccountName: EosEntityName
}

export const action = ({
  accountName,
  payerAccountName,
  payerAccountPermissionName,
  publicKeyActive,
  publicKeyOwner,
  pricekey,
  referralAccountName,
}: oreCreateAccountParams) => ({
  account: 'system.ore',
  name: 'createoreacc',
  authorization: [
    {
      actor: payerAccountName,
      permission: payerAccountPermissionName,
    },
  ],
  data: {
    creator: payerAccountName,
    newname: accountName, // Some versions of the system contract are running a different version of the newaccount code
    ownerkey: publicKeyOwner,
    activekey: publicKeyActive,
    pricekey,
    referral: referralAccountName || '',
  },
})
