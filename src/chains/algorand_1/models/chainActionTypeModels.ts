import { AlgorandValue } from './generalModels'
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

export type AlgorandActionAssetCreateParams = {
  fromAccountName: AlgorandAddress // Algorand address of sender
  memo: Uint8Array // arbitrary data for sender to store
  totalIssuance: number // total number of this asset in circulation
  defaultFrozen: boolean // whether user accounts will need to be unfrozen before transacting
  decimals: number // hint that the units of this asset are whole-integer amounts
  reserve: AlgorandAddress // specified address is considered the asset reserve (it has no special privileges, this is only informational)
  freeze: AlgorandAddress // specified address can freeze or unfreeze user asset holdings
  clawback: AlgorandAddress // specified address can revoke user asset holdings and send them to other addresses
  manager: AlgorandAddress // specified address can change reserve, freeze, clawback, and manager
  unitName: string // used to display asset units to user
  assetName: string // "friendly name" of asset
  assetURL?: string // optional string pointing to a URL relating to the asset
  assetMetadataHash?: string // optional hash commitment of some sort relating to the asset. 32 character length.
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
