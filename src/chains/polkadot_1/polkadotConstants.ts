// TODO: Update values for Polkadot

import { PolkadotKeyPairType } from './models'

// sign transaction default parameters
export const TRANSACTION_ENCODING = 'utf8'
export const DEFAULT_TRANSACTION_EXPIRY_IN_SECONDS = 30
export const DEFAULT_TRANSACTION_BLOCKS_BEHIND_REF_BLOCK = 3
export const CHAIN_BLOCK_FREQUENCY = 0.5 // time between blocks produced in seconds

// transaction confirmation default parameters
export const DEFAULT_BLOCKS_TO_CHECK = 20
export const DEFAULT_CHECK_INTERVAL = 500
export const DEFAULT_GET_BLOCK_ATTEMPTS = 10

// default unit for DOT transfers
// export const DEFAULT_POLKADOT_UNIT = EthUnit.Wei

// token related
export const NATIVE_CHAIN_TOKEN_SYMBOL = 'DOT'
/** The chain address of the default token/currency contract (if any) */
export const NATIVE_CHAIN_TOKEN_ADDRESS: any = null
export const DOT_TOKEN_PRECISION = 10

export const DEFAULT_POLKADOT_KEY_PAIR_TYPE = PolkadotKeyPairType.Ed25519
