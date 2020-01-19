import { EosEntityName, EosAsset, EosNewKeysOptions } from './generalModels'
import { EosPublicKey } from './cryptoModels'

/** Type of account to create */
export enum EosNewAccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native = 'Native',
  /** Native account on ORE chain */
  NativeOre = 'NativeOre',
  /** Native account created by calling a proxy (escrow) contract that actually creates the account */
  CreateEscrow = 'CreateEscrow',
  /** Virtual account - if supported by chain */
  VirtualNested = 'VirtualNested',
}

export type EosCreateAccountOptions = {
  accountName: EosEntityName // Optional - aka oreAccountName
  accountNamePrefix?: string // Default 'ore'
  creatorAccountName: EosEntityName
  creatorPermission: EosEntityName // Default = 'active' aka permission
  /** to generate new keys (using newKeysOptions), leave both publicKeys as null */
  publicKeys?: {
    owner?: EosPublicKey
    active?: EosPublicKey
  }
  newKeysOptions?: EosNewKeysOptions
  oreOptions?: {
    pricekey?: number // default = 1
    referralAccountName?: EosEntityName // default = ''  // aka referral
  }
  createEscrowOptions?: {
    contractName: EosEntityName // default = 'createescrow'
    appName: string // aka 'origin' field
  }
  createVirtualNestedOptions?: {
    parentAccountName: EosEntityName
    rootPermission?: EosEntityName
    actionsToLink?: {
      contract: EosEntityName
      action: string
    }[]
  }
  resourcesOptions?: {
    ramBytes: number
    stakeNetQuantity: EosAsset
    stakeCpuQuantity: EosAsset
    transfer: boolean
  }
}
