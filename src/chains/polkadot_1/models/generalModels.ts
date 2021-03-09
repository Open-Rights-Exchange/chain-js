import BN from 'bn.js'
import { AnyJson, AnyNumber } from '@polkadot/types/types'
import { AccountData } from '@polkadot/types/interfaces/balances'
import { Compact } from '@polkadot/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { BlockNumber, Balance, Weight, Hash } from '@polkadot/types/interfaces'
import { ChainSymbolBrand } from '../../../models'

export type PolkadotChainEndpoint = {
  /**
   * The rpc endpoint url of chain (parachain | relay-chain)
   */
  url: string
}

export type PolkadotChainManifest = {
  /**
   * In case, the chain is parachain
   * Identifer referring to a specific parachain.
   * The relay-chain runtime guarantees that this id is unique
   * for the duration of any session.
   * NOTE: https://w3f.github.io/parachain-implementers-guide/types/candidate.html#para-id
   *
   * If the id is -1, then the chain is relay-chain.
   */
  id: number
  endpoint: PolkadotChainEndpoint
}

export type PolkadotChainSettings = {
  /**
   * In case the chain that we connect is a relay-chain, then the relayEndpoint is useless
   */
  relayEndpoint?: PolkadotChainEndpoint
  otherParachains: PolkadotChainManifest[]
}

export type PolkadotChainInfo = {
  headBlockNumber: number
  headBlockTime: Date
  version: string
  nativeInfo: PolkadotNativeInfo
}

export type PolkadotNativeInfo = {
  chain: string
  name: string
  SS58: number
  tokenDecimals: number[]
  tokenSymbols: string[]
  transacitonByteFee: number
  metadata: any
}

export type PolkadotSymbol = string & ChainSymbolBrand

export type PolkadotChainSettingsCommunicationSettings = {
  blocksToCheck: number
  checkInterval: number
  getBlockAttempts: number
}

export type PolkadotBlockNumber = BlockNumber | BN | BigInt | Uint8Array | number | string

export type PolkadotBlock = Record<string, AnyJson>

export type PolkadotAddress = string | Uint8Array

export type PolkadotKeyringPair = KeyringPair

export type DotAmount = Compact<Balance> | AnyNumber | Uint8Array

export type PolkadotPaymentInfo = {
  weight: Weight
  partialFee: Balance
}

export type PolkadotAccountBalance = AccountData

export type PolkadotHash = Hash
