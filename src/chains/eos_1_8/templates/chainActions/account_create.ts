import { EosEntityName, EosPublicKey, EosAsset, EosAuthorizationKeyStruct, EosActionStruct, DecomposeReturn } from '../../models'
import { ChainActionType } from '../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull, toEosPublicKey } from '../../helpers'
import { getFirstValueIfOnlyOneExists } from '../../../../helpers'

const actionName = 'newaccount'

interface createAccountNativeParams {
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
}: createAccountNativeParams): EosActionStruct[] => [
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
  {
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
  },
]

export const decomposeAction = (action: EosActionStruct): DecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.creator && data?.name && data?.owner && data?.active) {
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const ownerKey: EosAuthorizationKeyStruct = getFirstValueIfOnlyOneExists(data.owner.keys)
    const activeKey: EosAuthorizationKeyStruct = getFirstValueIfOnlyOneExists(data.active.keys)

    const returnData: Partial<createAccountNativeParams> = {
      accountName: toEosEntityName(data.name),
      creatorAccountName: toEosEntityName(data.creator),
      creatorPermission: toEosEntityNameOrNull(auth.permission),
      publicKeyActive: ownerKey?.key,
      publicKeyOwner: activeKey?.key,
    }

    return {
      chainActionType: ChainActionType.AccountCreate,
      args: { ...returnData },
    }
  }

  return null
}
