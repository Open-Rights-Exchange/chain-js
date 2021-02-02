import { ChainSymbolBrand } from '../../../models'
import {
	ModelsCryptoAes,
} from '../../../models'

export type PolkadotChainEndpoint = {
	url: string
}

export type PolkadotChainSettings = {}

export type PolkadotChainInfo = {
	headBlockNumber: number
	headBlockHash: string
	nativeInfo: PolkadotNativeInfo
}

export type PolkadotNativeInfo = {
	chain: string
	existentialDeposit: number
	transactionByteFee: number
}

export type PolkadotSymbol = string & ChainSymbolBrand

export type PolkadotNewKeysOptions = {
	password: string
	encryptionOptions?: ModelsCryptoAes.AesEncryptionOptions
}

export type PolkadotChainSettingsCommunicationSettings = {
	blocksToCheck: number
	checkInterval: number
	getBlockAttempts: number
}

export type PolkadotBlockHash = string | Uint8Array