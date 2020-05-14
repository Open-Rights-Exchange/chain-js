import { EosEntityName, EosPublicKey } from '../../models'

interface oreCreateAccountParams {
  accountName: EosEntityName
  creatorAccountName: EosEntityName
  creatorPermission: EosEntityName
  publicKeyActive: EosPublicKey
  publicKeyOwner: EosPublicKey
  pricekey: string
  referralAccountName: EosEntityName
}

export const composeAction = ({
  accountName,
  creatorAccountName,
  creatorPermission,
  publicKeyActive,
  publicKeyOwner,
  pricekey,
  referralAccountName,
}: oreCreateAccountParams) => ({
  account: 'system.ore',
  name: 'createoreacc',
  authorization: [
    {
      actor: creatorAccountName,
      permission: creatorPermission,
    },
  ],
  data: {
    creator: creatorAccountName,
    newname: accountName, // Some versions of the system contract are running a different version of the newaccount code
    ownerkey: publicKeyOwner,
    activekey: publicKeyActive,
    pricekey,
    referral: referralAccountName || '',
  },
})

export const decomposeAction = (action: any) => {
}