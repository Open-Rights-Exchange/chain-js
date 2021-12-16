import * as nacl from 'tweetnacl'
// import { IndexedObject } from '../../models'
import { Models } from '@open-rights-exchange/chainjs'
import { AlgorandUnit } from './models'

export const ALGORAND_ADDRESS_LENGTH = 58
export const ALGORAND_ADDRESS_BYTES_ONLY_LENGTH = 36
export const ALGORAND_CHECKSUM_BYTE_LENGTH = 4
export const PUBLIC_KEY_LENGTH = nacl.sign.publicKeyLength
export const ALGORAND_EMPTY_CONTRACT_NAME = 'none'
export const ALGORAND_POST_CONTENT_TYPE = {
  'content-type': 'application/x-binary',
}
/** Default number of rounds before transaction expires */
export const ALGORAND_DEFAULT_TRANSACTION_VALID_BLOCKS = 1000
export const DEFAULT_TIMEOUT_FOR_TRX_CONFIRM = 500
export const DEFAULT_ALGO_UNIT = AlgorandUnit.Microalgo

/** number of chain blocks to poll after submitting a transaction before failing */
export const DEFAULT_BLOCKS_TO_CHECK = 20
/** time to wait (in ms) between checking chain for a new block (to see if transaction appears within it) */
export const DEFAULT_CHECK_INTERVAL = 500
/** minimum milliseconds between requests - prevents getting blacklisted by pinging API too quickly between calls */
export const MINIMUM_CHECK_INTERVAL = 500
/** time in seconds between blocks */
export const ALGORAND_CHAIN_BLOCK_FREQUENCY = 4.39
/** number of times to attempt to read a chain endpoint before failing the read */
export const DEFAULT_GET_BLOCK_ATTEMPTS = 10

/** The chain address of the default token contract (if any) */
export const NATIVE_CHAIN_TOKEN_ADDRESS: any = null
/** The symbol for the native token/currency on the chain */
export const NATIVE_CHAIN_TOKEN_SYMBOL = 'algo'
/** The decimal precision of the Algo token */
export const NATIVE_CHAIN_TOKEN_PRECISION = 6
/** If the chain doesnt report a minimum fee, set min fee for a TX to this */
export const MINIMUM_TRANSACTION_FEE_FALLBACK = 1000

/** Slow -> minimum transaction fee - we pass in 0 for the fixedFee then it will use the minimum fee
 *  Average ->  suggested fee per byte from chainState
 *  Fast -> multiply suggested fee by 1.2 - as per recommendation from Algorand Foundation
 */
export const TRANSACTION_FEE_PRIORITY_MULTIPLIERS: Models.IndexedObject = {
  slow: 0,
  average: 1,
  fast: 1.2,
}
