import { AlgorandUnit } from './models'

export const ALGORAND_ADDRESS_BYTE_LENGTH = 36
export const ALGORAND_ADDRESS_LENGTH = 58
export const ALGORAND_CHECKSUM_BYTE_LENGTH = 4
export const ALGORAND_POST_CONTENT_TYPE = { 'content-type': 'application/x-binary' }
export const DEFAULT_TIMEOUT_FOR_TRX_CONFIRM = 500
export const DEFAULT_ALGO_SYMBOL = AlgorandUnit.Microalgo
/** The chain address of the default token contract (if any) */
export const DEFAULT_CHAIN_TOKEN_ADDRESS: any = null
export const DEFAULT_ALGO_TRX_LAST_ROUND = 1000
// token related
export const NATIVE_CHAIN_SYMBOL = 'algo'
