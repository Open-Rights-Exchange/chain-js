import { ValueTransferParams } from '../../../models'
import { AlgorandValue } from './generalModels'
// eslint-disable-next-line import/no-cycle
import { AlgorandTransactionHeader } from './transactionModels'
import { AlgorandAddress } from './cryptoModels'

export enum AlgorandChainActionType {
  AssetTransfer = 'AssetTransfer',
}

export type AlgorandValueTransferParams = AlgorandTransactionHeader & ValueTransferParams

export type AlgorandAssetCreateParams = AlgorandTransactionHeader & {
  fromAccountName: AlgorandAddress // Algorand address of sender
  memo: AlgorandValue // arbitrary data for sender to store
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

export type AlgorandAssetTransferParams = AlgorandTransactionHeader & {
  fromAccountName: AlgorandAddress // Algorand address of sender
  toAccountName: AlgorandAddress // Algorand address of asset recipient
  memo: AlgorandValue // arbitrary data for sender to store
  amount: number // integer amount of assets to send
  revocationTarget?: AlgorandAddress // - optional - if provided, and if "fromAccountName" is the asset's revocation manager, then deduct from "revocationTarget" rather than "fromAccountName"
  assetIndex: number // int asset index uniquely specifying the asset
}
