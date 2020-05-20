import { EosEntityName, EosPublicKey, EosActionStruct, DecomposeReturn, EosChainActionType } from '../../models'
import {
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityName,
  toEosPublicKey,
  toEosEntityNameOrNull,
} from '../../helpers'

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
}: createEscrowCreateParams): EosActionStruct => ({
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

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { account, name, data, authorization } = action

  if (name === actionName && data?.memo && data?.account && data?.ownerkey && data?.activekey && data?.origin) {
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)

    const returnData: Partial<createEscrowCreateParams> = {
      accountName: toEosEntityName(data.account),
      contractName: toEosEntityName(account),
      appName: data.origin,
      creatorAccountName: toEosEntityName(data.memo),
      creatorPermission: toEosEntityNameOrNull(auth?.permission),
      publicKeyActive: toEosPublicKey(data.activekey),
      publicKeyOwner: toEosPublicKey(data.ownerkey),
      pricekey: null,
      referralAccountName: toEosEntityName(data.referral),
    }

    return {
      chainActionType: EosChainActionType.CreateEscrowCreate,
      args: { ...returnData },
    }
  }

  return null
}
