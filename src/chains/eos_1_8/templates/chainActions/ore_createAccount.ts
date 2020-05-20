import { EosEntityName, EosPublicKey, EosChainActionType, EosActionStruct, DecomposeReturn } from '../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosPublicKey,
  toEosEntityNameOrNull,
} from '../../helpers'

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
  const { name, data, authorization } = action

  if (name === actionName && data?.creator && data?.newname && data?.ownerkey && data?.activekey) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: oreCreateAccountParams = {
      accountName: toEosEntityName(data.newname),
      creatorAccountName: toEosEntityName(data.creator),
      creatorPermission: toEosEntityNameOrNull(auth?.permission),
      publicKeyActive: toEosPublicKey(data.ownerkey),
      publicKeyOwner: toEosPublicKey(data.activekey),
      pricekey: data.pricekey,
      referralAccountName: toEosEntityName(data.referral),
    }
    return {
      chainActionType: EosChainActionType.OreCreateAccount,
      args: { ...returnData },
    }
  }

  return null
}
