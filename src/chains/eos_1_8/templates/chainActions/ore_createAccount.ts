import { EosEntityName, EosPublicKey, EosChainActionType, EosActionStruct, DecomposeReturn } from '../../models'
import { toEosEntityName } from '../../helpers'

const actionName = 'createoreacc'

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
}: oreCreateAccountParams): EosActionStruct => ({
  account: toEosEntityName('system.ore'),
  name: actionName,
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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data } = action

  if (name === actionName && data?.creator && data?.newname && data?.ownerkey && data?.activekey) {
    return {
      actionType: EosChainActionType.OreCreateAccount,
      args: { ...data },
    }
  }

  return null
}
