import { EosEntityName, EosPublicKey } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'create'

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
  name: actionName,
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
  const { name, data } = action

  if (name === actionName && data?.memo && data?.account && data?.ownerkey && data?.activekey && data?.origin) {
    return {
      actionType: ChainActionType.CreateEscrowCreate,
      args: { ...data },
    }
  }

  return null
}
