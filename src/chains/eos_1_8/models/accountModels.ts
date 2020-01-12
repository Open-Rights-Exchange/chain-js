import { EosEntityName, EosAsset } from './generalModels'
import { EosPublicKey } from './cryptoModels'

/** Type of account to craate */
export enum EosAccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native,
  /** Native account on ORE chain */
  NativeOre,
  /** Native account created by calling a proxy (escrow) contract that actually creates the account */
  CreateEscrow,
  /** Virtual account - if supported by chain */
  VirtualNested,
}

export type EosCreateAccountOptions = {
  accountNamePrefix?: string // Default 'ore'
  // newAccountName: EosEntityName,      // Optional - aka oreAccountName
  creatorAccountName: EosEntityName
  creatorPermission: EosEntityName // Default = 'active' aka permission
  /** to generate new keys (using newKeysOptions), leave both publicKeys as null */
  publicKeys?: {
    owner?: EosPublicKey
    active?: EosPublicKey
  }
  newKeysOptions?: {
    newKeysPassword?: string
    newKeysSalt?: string
  }
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
