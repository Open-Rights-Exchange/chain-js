// sign transaction default parameters
export const DEFAULT_TRANSACTION_EXPIRY_IN_SECONDS = 300 // 5 minutes
export const DEFAULT_TRANSACTION_BLOCKS_BEHIND_REF_BLOCK = 3
export const TRANSACTION_ENCODING = 'utf8'
export const CHAIN_BLOCK_FREQUENCY = 0.5 // time between blocks produced in seconds
export const ACCOUNT_NAME_MAX_LENGTH = 12

/** number of chain blocks to poll after submitting a transaction before failing */
export const DEFAULT_BLOCKS_TO_CHECK = 20
/** time to wait (in ms) between checking chain for a new block (to see if transaction appears within it) */
export const DEFAULT_CHECK_INTERVAL = 500
/** number of times to attempt to read a chain endpoint before failing the read */
export const DEFAULT_GET_BLOCK_ATTEMPTS = 10

/** default prefix for an autogenerate account name */
export const DEFAULT_ACCOUNT_NAME_PREFIX = ''
export const DEFAULT_CREATEESCROW_CONTRACT = 'createescrow'
export const DEFAULT_ORE_ACCOUNT_PRICEKEY = 1
export const DEFAULT_CREATEESCROW_APPNAME = 'free'

// token related
export const NATIVE_CHAIN_SYMBOL = 'EOS'

/** The chain address of the default token contract (if any) */
export const DEFAULT_CHAIN_TOKEN_ADDRESS = 'eosio.token'
