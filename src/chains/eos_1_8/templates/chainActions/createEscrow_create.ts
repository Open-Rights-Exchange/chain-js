import { EosEntityName, EosPublicKey } from '../../models'

interface createEscrowCreateParams {
  accountName: EosEntityName
  contractName: EosEntityName
  appName: string
  creatorAccountName: EosEntityName
  creatorPermission: EosEntityName
  publicKeyActive: EosPublicKey
  publicKeyOwner: EosPublicKey
  pricekey: string
  referralAccountName: EosEntityName
}

export const composeAction = ({
  accountName,
  contractName,
  appName,
  creatorAccountName,
  creatorPermission,
  publicKeyActive,
  publicKeyOwner,
  // pricekey,
  referralAccountName,
}: createEscrowCreateParams) => ({
  account: contractName,
  name: 'create',
  authorization: [
    {
      actor: creatorAccountName,
      permission: creatorPermission,
    },
  ],
  data: {
    memo: creatorAccountName,
    account: accountName,
    ownerkey: publicKeyOwner,
    activekey: publicKeyActive,
    origin: appName,
    referral: referralAccountName || '',
  },
})

export const decomposeAction = (action: any) => {
}