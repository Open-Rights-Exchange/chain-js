import { EosEntityName, EosPublicKey, EosAsset } from '../../models'

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
}: createAccountNativeParams) => [
  {
    account: 'eosio',
    name: 'newaccount',
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
    account: 'eosio',
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
    account: 'eosio',
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

export const decomposeAction = (action: any) => {
  // const actionLength = action.length
  // if (actionLength) {

  // }
}