// eslint-disable-next-line import/no-cycle
import { AlgorandAddress } from './cryptoModels'
import { ChainActionType } from '../../../models'

/** ChainJS action type names */
export enum AlgorandChainActionType {
  AssetCreate = 'AssetCreate',
  AssetConfig = 'AssetConfig',
  AssetDestroy = 'AssetDestroy',
  AssetFreeze = 'AssetFreeze',
  AssetTransfer = 'AssetTransfer',
  KeyRegistration = 'KeyRegistration',
  Payment = 'Payment',
}

export type AlgorandDecomposeReturn = {
  chainActionType: ChainActionType | AlgorandChainActionType
  args: any
  partial?: boolean
}

export type AlgorandKeyRegistrationParams = {
  from: AlgorandAddress // Algorand address of sender
  note: string // arbitrary data for sender to store
  voteKey: AlgorandAddress // voting key. for key deregistration, leave undefined
  selectionKey: AlgorandAddress // selection key. for key deregistration, leave undefined
  voteFirst: number // first round on which voteKey is valid
  voteLast: number // last round on which voteKey is valid
  voteKeyDilution: number // specified address can freeze or unfreeze user asset holdings
}

export type AlgorandActionAssetCreateParams = {
  from: AlgorandAddress // Algorand address of sender
  note: string // arbitrary data for sender to store
  totalIssuance: number // total number of this asset in circulation
  assetDefaultFrozen: boolean // whether user accounts will need to be unfrozen before transacting
  assetDecimals: number // hint that the units of this asset are whole-integer amounts
  assetReserve: AlgorandAddress // specified address is considered the asset reserve (it has no special privileges, this is only informational)
  assetFreeze: AlgorandAddress // specified address can freeze or unfreeze user asset holdings
  assetClawback: AlgorandAddress // specified address can revoke user asset holdings and send them to other addresses
  assetManager: AlgorandAddress // specified address can change reserve, freeze, clawback, and manager
  assetUnitName: string // used to display asset units to user
  assetName: string // "friendly name" of asset
  assetURL?: string // optional string pointing to a URL relating to the asset
  assetMetadataHash?: string // optional hash commitment of some sort relating to the asset. 32 character length.
}

export type AlgorandActionAssetConfigParams = {
  from: AlgorandAddress // Algorand address of sender
  note: string // arbitrary data for sender to store
  assetIndex: number // uniquely specifying the asset
  assetManager: AlgorandAddress // new asset manager Algorand address
  assetReserve: AlgorandAddress // new reserve Algorand address
  assetFreeze: AlgorandAddress //  new freeze manager Algorand address
  assetClawback: AlgorandAddress // specified address can revoke user asset holdings and send them to other addresses
  strictEmptyAddressChecking: boolean // throw an error if any of manager, reserve, freeze, or clawback are undefined. optional, defaults to true.
}

export type AlgorandActionAssetDestroyParams = {
  from: AlgorandAddress // Algorand address of sender
  note: string // arbitrary data for sender to store
  assetIndex: number // uniquely specifying the asset
}

export type AlgorandActionAssetFreezeParams = {
  from: AlgorandAddress // Algorand address of sender
  note: string // arbitrary data for sender to store
  assetIndex: number // uniquely specifying the asset
  freezeTarget: AlgorandAddress //  Algorand address being frozen or unfrozen
  freezeState: boolean // true if freezeTarget should be frozen, false if freezeTarget should be allowed to transact
}

export type AlgorandActionAssetTransferParams = {
  from: AlgorandAddress
  to: AlgorandAddress
  closeRemainderTo?: AlgorandAddress
  assetRevocationTarget?: AlgorandAddress
  amount: number
  note: string
  assetIndex: number
}

export type AlgorandActionPaymentParams = {
  from: AlgorandAddress
  to: AlgorandAddress
  amount: number
  closeRemainderTo?: AlgorandAddress
  note: string
}
