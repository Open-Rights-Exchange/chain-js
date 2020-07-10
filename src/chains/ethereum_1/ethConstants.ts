import { EthUnit } from './models'

// sign transaction default parameters
export const TRANSACTION_ENCODING = 'utf8'
export const DEFAULT_TRANSACTION_EXPIRY_IN_SECONDS = 30
export const DEFAULT_TRANSACTION_BLOCKS_BEHIND_REF_BLOCK = 3
export const CHAIN_BLOCK_FREQUENCY = 0.5 // time between blocks produced in seconds
export const ACCOUNT_NAME_MAX_LENGTH = 12

// transaction confirmation default parameters
export const DEFAULT_BLOCKS_TO_CHECK = 20
export const DEFAULT_CHECK_INTERVAL = 500
export const DEFAULT_GET_BLOCK_ATTEMPTS = 10

// default values for ETH transfers
export const DEFAULT_ETH_SYMBOL = EthUnit.Wei

// address realted
export const ZERO_HEX = '0x00'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const EMPTY_HEX = '0x'
export const HEX_PREFIX = '0x'

// token related
export const NATIVE_CHAIN_SYMBOL = 'ETH'
export const DEFAULT_TOKEN_PRECISION = 0 // assumes a token has no digits of precision unless specified
export const ETH_TOKEN_PRECISION = 18

/** The chain address of the default token contract (if any) */
export const DEFAULT_CHAIN_TOKEN_ADDRESS: any = null
