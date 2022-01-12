import { ChainActionType } from '../../../../../models'
import { getFirstValueIfOnlyOneExists } from '../../../../../helpers'
import {
  EosEntityName,
  EosPublicKey,
  EosAsset,
  EosAuthorizationKeyStruct,
  EosActionStruct,
  EosDecomposeReturn,
} from '../../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
  toEosPublicKeyOrNull,
  EosAssetHelper,
} from '../../../helpers'

const actionName = 'newaccount'

export interface CreateAccountNativeParams {
  accountName: EosEntityName
  creatorAccountName: EosEntityName
  creatorPermission: EosEntityName
  publicKeyActive: EosPublicKey
  publicKeyOwner: EosPublicKey
  ramBytes: number
  stakeNetQuantity: EosAsset
  stakeCpuQuantity: EosAsset
  transfer: boolean
}
export const composeAction = ({
  accountName,
  creatorAccountName,
  creatorPermission,
  publicKeyActive,
  publicKeyOwner,
  ramBytes,
  stakeNetQuantity,
  stakeCpuQuantity,
  transfer,
}: CreateAccountNativeParams): EosActionStruct[] => {
  const actions: EosActionStruct[] = [
    {
      account: toEosEntityName('eosio'),
      name: actionName,
      authorization: [
        {
          actor: creatorAccountName,
          permission: creatorPermission,
        },
      ],
      data: {
        creator: creatorAccountName,
        name: accountName,
        owner: {
          threshold: 1,
          keys: [
            {
              key: publicKeyOwner,
              weight: 1,
            },
          ],
          accounts: Array<any>(),
          waits: Array<any>(),
        },
        active: {
          threshold: 1,
          keys: [
            {
              key: publicKeyActive,
              weight: 1,
            },
          ],
          accounts: Array<any>(),
          waits: Array<any>(),
        },
      },
    },
    {
      account: toEosEntityName('eosio'),
      name: 'buyrambytes',
      authorization: [
        {
          actor: creatorAccountName,
          permission: creatorPermission,
        },
      ],
      data: {
        payer: creatorAccountName,
        receiver: accountName,
        bytes: ramBytes,
      },
    },
  ]

  // add delegatebw action to stake resources (if non-zero)
  const { amount: netAmount } = new EosAssetHelper(null, null, stakeNetQuantity)
  const { amount: cpuAmount } = new EosAssetHelper(null, null, stakeCpuQuantity)
  if (parseFloat(netAmount) !== 0 || parseFloat(cpuAmount) !== 0) {
    // Note: Float won't handle high precision numbers (which shouldnt be a problem with EOS)
    actions.push({
      account: toEosEntityName('eosio'),
      name: 'delegatebw',
      authorization: [
        {
          actor: creatorAccountName,
          permission: creatorPermission,
        },
      ],
      data: {
        from: creatorAccountName,
        receiver: accountName,
        stake_net_quantity: stakeNetQuantity,
        stake_cpu_quantity: stakeCpuQuantity,
        transfer,
      },
    })
  }

  return actions
}

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.creator && data?.name && data?.owner && data?.active) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    // Only works if there's 1 key in the array otherwise we don't know which keys to return
    const ownerKey: EosAuthorizationKeyStruct = getFirstValueIfOnlyOneExists(data.owner.keys)
    const activeKey: EosAuthorizationKeyStruct = getFirstValueIfOnlyOneExists(data.active.keys)

    const returnData: Partial<CreateAccountNativeParams> = {
      accountName: toEosEntityName(data.name),
      creatorAccountName: toEosEntityName(data.creator),
      creatorPermission: toEosEntityNameOrNull(auth?.permission),
      publicKeyActive: toEosPublicKeyOrNull(ownerKey?.key),
      publicKeyOwner: toEosPublicKeyOrNull(activeKey?.key),
    }
    const partial = !returnData?.creatorPermission || !returnData.publicKeyActive || !returnData.publicKeyOwner

    return {
      chainActionType: ChainActionType.AccountCreate,
      args: returnData,
      partial,
    }
  }

  return null
}
