import { AlgorandUnit } from './models'

export const ALGORAND_ADDRESS_BYTE_LENGTH = 36
export const ALGORAND_ADDRESS_LENGTH = 58
export const ALGORAND_CHECKSUM_BYTE_LENGTH = 4
/** Options required by scrypt library to derive a key from password and salt */
export const ALGORAND_PASSWORD_ENCRYPTION_CONSTANTS = {
  N: 16384,
  r: 8,
  p: 1,
  dkLen: 32,
  encoding: 'binary',
}
export const ALGORAND_POST_CONTENT_TYPE = { 'content-type': 'application/x-binary' }
/** Number of rounds to wait after the first round for the transaction confirmation */
export const ALGORAND_TRX_COMFIRMATION_ROUNDS = 1000
export const DEFAULT_TIMEOUT_FOR_TRX_CONFIRM = 500
export const DEFAULT_ALGO_SYMBOL = AlgorandUnit.Microalgo
/** The chain address of the default token contract (if any) */
export const DEFAULT_CHAIN_TOKEN_ADDRESS: any = null
// token related
export const NATIVE_CHAIN_SYMBOL = 'algo'
