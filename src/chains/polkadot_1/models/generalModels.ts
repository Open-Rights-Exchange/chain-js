import BN from 'bn.js'
import { AnyJson, AnyNumber, } from '@polkadot/types/types'
import { AccountData } from '@polkadot/types/interfaces/balances'
import { Compact } from '@polkadot/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { BlockNumber, Balance, Weight, Hash, } from '@polkadot/types/interfaces'
import { ChainSymbolBrand, PublicKeyBrand, PrivateKeyBrand, } from '../../../models'

export type PolkadotChainEndpoint = {
	url: string
	options?: {
		headers?: { [key: string]: string }
	}
}

export type PolkadotChainSettings = {}

export type PolkadotChainInfo = {	
	headBlockNumber: number
	headBlockTime: Date
	version: string
	nativeInfo: PolkadotNativeInfo
}

export type PolkadotNativeInfo = {
	chain: string
	transacitonByteFee: Balance
	decimals: number
	SS58: number
}

export type PolkadotSymbol = string & ChainSymbolBrand

export type PolkadotChainSettingsCommunicationSettings = {
	blocksToCheck: number
	checkInterval: number
	getBlockAttempts: number
}

export type PolkadotBlockNumber =  BlockNumber | BN | BigInt | Uint8Array | number | string

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

export type PolkadotKeypairType = 'ed25519' | 'sr25519' | 'ecdsa'

export type PolkadotNewKeysOptions = {
	phrase?: string
	type?: PolkadotKeypairType
	derivationPath?: string
}

export type PolkadotKeypair = {
  publicKey: PolkadotPublicKey
	secretKey: PolkadotPrivateKey
}

export type PolkadotPublicKey = Uint8Array & PublicKeyBrand

export type PolkadotPrivateKey = Uint8Array & PrivateKeyBrand