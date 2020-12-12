import { AlgorandAddress } from './cryptoModels'
import { ChainActionType } from '../../../models'

/** ChainJS action type names */
export enum AlgorandChainActionType {
  ApplicationClear = 'ApplicationClear', // clear
  ApplicationCloseOut = 'ApplicationCloseOut', // closeout
  ApplicationCreate = 'ApplicationCreate', // create
  ApplicationDelete = 'ApplicationDelete', // delete
  ApplicationNoOp = 'ApplicationNoOp', // call
  ApplicationOptIn = 'ApplicationOptIn', // optIn
  ApplicationUpdate = 'ApplicationUpdate', // update
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
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}

/** Make a transaction that will create an application */
export type AlgorandActionApplicationCreateTxn = {
  from: AlgorandAddress // Algorand address of sender
  onComplete?: number // algosdk.OnApplicationComplete, what application should do once the program is done being run
  approvalProgram?: string // the compiled TEAL that approves a transaction
  clearProgram?: string // the compiled TEAL that runs when clearing state
  numLocalInts?: number // restricts number of ints in per-user local state
  numLocalByteSlices?: number // restricts number of byte slices in per-user local state
  numGlobalInts?: number // restricts number of ints in global state
  numGlobalByteSlices?: number // restricts number of byte slices in global state
  appArgs?: string[] // optional - Array of Uint8Array, any additional arguments to the application
  accounts?: AlgorandAddress[] // optional - Array of Address strings, any additional accounts to supply to the application
  foreignApps?: number[] // optional - Array of int, any other apps used by the application, identified by index
  foreignAssets?: number[] // optional - Array of int, any assets used by the application, identified by index
  note: string // arbitrary data for sender to store
  lease?: string
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}

/** Make a transaction that changes an application's approval and clear programs */
export type AlgorandActionApplicationUpdateTxn = {
  from: AlgorandAddress // Algorand address of sender
  appIndex?: number // the ID of the app to be updated
  approvalProgram?: string // the compiled TEAL that approves a transaction
  clearProgram?: string // the compiled TEAL that runs when clearing state
  appArgs?: string[] // optional - Array of Uint8Array, any additional arguments to the application
  accounts?: AlgorandAddress[] // optional - Array of Address strings, any additional accounts to supply to the application
  foreignApps?: number[] // optional - Array of int, any other apps used by the application, identified by index
  foreignAssets?: number[] // optional - Array of int, any assets used by the application, identified by index
  note: string // arbitrary data for sender to store
  lease?: string
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}

/** Action for several Application type transactions */
export type AlgorandActionApplicationMultiPurposeTxn = {
  from: AlgorandAddress // Algorand address of sender
  appIndex: number // the ID of the app to use
  appArgs?: string[] // optional - Array of Uint8Array, any additional arguments to the application
  accounts?: AlgorandAddress[] // optional - Array of Address strings, any additional accounts to supply to the application
  foreignApps?: number[] // optional - Array of int, any other apps used by the application, identified by index
  foreignAssets?: number[] // optional - Array of int, any assets used by the application, identified by index
  note: string // arbitrary data for sender to store
  lease?: string
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
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
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
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
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}

export type AlgorandActionAssetDestroyParams = {
  from: AlgorandAddress // Algorand address of sender
  note: string // arbitrary data for sender to store
  assetIndex: number // uniquely specifying the asset
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}

export type AlgorandActionAssetFreezeParams = {
  from: AlgorandAddress // Algorand address of sender
  note: string // arbitrary data for sender to store
  assetIndex: number // uniquely specifying the asset
  freezeTarget: AlgorandAddress //  Algorand address being frozen or unfrozen
  freezeState: boolean // true if freezeTarget should be frozen, false if freezeTarget should be allowed to transact
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}

export type AlgorandActionAssetTransferParams = {
  from: AlgorandAddress
  to: AlgorandAddress
  closeRemainderTo?: AlgorandAddress
  assetRevocationTarget?: AlgorandAddress
  amount: number
  note: string
  assetIndex: number
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}

export type AlgorandActionPaymentParams = {
  from: AlgorandAddress
  to: AlgorandAddress
  amount: number
  closeRemainderTo?: AlgorandAddress
  note: string
  reKeyTo?: AlgorandAddress // optional rekeying parameter to make trx a rekeying trx
}
