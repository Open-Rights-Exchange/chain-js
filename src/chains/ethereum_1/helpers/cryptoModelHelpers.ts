import { isValidPrivate, isValidPublic, isValidAddress, ECDSASignature, BN } from 'ethereumjs-util'
import { isString } from 'util'
import {
  EthereumSignature,
  EthereumPublicKey,
  EthereumPrivateKey,
  EthereumAddress,
  EthereumTxData,
  EthUnit,
} from '../models'
import { toEthBuffer, ensureHexPrefix } from './generalHelpers'

// Reimplemented from ethereumjs-util module to workaround a current bug
/** Checks if a valid signature with ECDSASignature */
export function isValidSignature(v: number, r: Buffer, s: Buffer): boolean {
  if (!v || !r || !s) return false
  const SECP256K1_N_DIV_2 = new BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16)
  const SECP256K1_N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16)

  if (r.length !== 32 || s.length !== 32) {
    return false
  }

  const rBN: BN = new BN(r)
  const sBN: BN = new BN(s)

  if (rBN.isZero() || rBN.gt(SECP256K1_N) || sBN.isZero() || sBN.gt(SECP256K1_N)) {
    return false
  }

  if (sBN.cmp(SECP256K1_N_DIV_2) === 1) {
    return false
  }
  return true
}

export function isValidEthereumTxData(value: string | Buffer | EthereumTxData): value is EthereumTxData {
  if (!value) return false
  if (typeof value === 'string') return ensureHexPrefix(value).length > 2
  return true
}

export function isValidEthereumPublicKey(value: string | EthereumPublicKey): value is EthereumPublicKey {
  if (!value) return false
  return isValidPublic(toEthBuffer(ensureHexPrefix(value)))
}

export function isValidEthereumPrivateKey(value: EthereumPrivateKey | string): value is EthereumPrivateKey {
  if (!value) return false
  return isValidPrivate(toEthBuffer(ensureHexPrefix(value)))
}

export function isValidEthereumSignature(
  value: EthereumSignature | string | ECDSASignature,
): value is EthereumSignature {
  let signature: ECDSASignature
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  if (!value) return false
  if (isString(value)) {
    signature = JSON.parse(value)
  } else {
    signature = value
  }
  const { v, r, s } = signature
  return isValidSignature(v, r, s)
}

// For a given private key, pr, the Ethereum address A(pr) (a 160-bit value) is defined as the right most 160-bits of the Keccak hash of the corresponding ECDSA public key.
export function isValidEthereumAddress(value: string | Buffer | EthereumAddress): boolean {
  if (!value) return false
  if (typeof value === 'string') return isValidAddress(value)
  return true
}

/** Accepts hex string checks if a valid ethereum data hex
 *  Returns EthereumPublicKey with prefix
 */
export function toEthereumTxData(value: string | Buffer): EthereumTxData {
  if (isValidEthereumTxData(value)) {
    return typeof value === 'string' ? (ensureHexPrefix(value) as EthereumTxData) : (value as EthereumTxData)
  }
  throw new Error(`Not a valid ethereum public key:${value}.`)
}

/** Accepts hex string checks if a valid ethereum public key
 *  Returns EthereumPublicKey with prefix
 */
export function toEthereumPublicKey(value: string): EthereumPublicKey {
  if (isValidEthereumPublicKey(value)) {
    return ensureHexPrefix(value) as EthereumPublicKey
  }
  throw new Error(`Not a valid ethereum public key:${value}.`)
}

/** Accepts hex string checks if a valid ethereum private key
 *  Returns EthereumPrivateKey with prefix
 */
export function toEthereumPrivateKey(value: string): EthereumPrivateKey {
  if (isValidEthereumPrivateKey(value)) {
    return ensureHexPrefix(value) as EthereumPrivateKey
  }
  throw new Error(`Not a valid ethereum private key:${value}.`)
}

/** Accepts ECDSASignature object or stringified version of it
 *  Returns EthereumSignature
 */
export function toEthereumSignature(value: string | ECDSASignature): EthereumSignature {
  if (isValidEthereumSignature(value)) {
    return value
  }
  throw new Error(`Not a valid ethereum signature:${value}.`)
}

/** Accepts hex string checks if a valid ethereum address
 *  Returns EthereumAddress with prefix
 */
export function toEthereumAddress(value: string): EthereumAddress {
  if (isValidEthereumAddress(value)) {
    return ensureHexPrefix(value) as EthereumAddress
  }
  throw new Error(`Not a valid ethereum address:${value}.`)
}

export function toEthUnit(unit: string): EthUnit {
  try {
    return unit as EthUnit
  } catch (err) {
    throw new Error('Not a valid ethereum unit type.')
  }
}
