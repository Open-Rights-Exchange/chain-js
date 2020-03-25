import { isValidPrivate, isValidPublic, isValidAddress, ECDSASignature, BN } from 'ethereumjs-util'
import { isString } from 'util'
import { EthereumSignature, EthereumPublicKey, EthereumPrivateKey, EthereumAddress, EthereumTxData } from '../models'
import { toEthBuffer, addPrefixToHex } from './generalHelpers'

// Reimplemented from ethereumjs-util module to workaround a current bug
/** Checks if a valid signature with ECDSASignature */
export function isValidSignature(v: number, r: Buffer, s: Buffer): boolean {
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
  if (typeof value === 'string') return addPrefixToHex(value).length > 2
  return true
}

export function isValidEthereumPublicKey(value: string | EthereumPublicKey): value is EthereumPublicKey {
  return isValidPublic(toEthBuffer(addPrefixToHex(value)))
}

export function isValidEthereumPrivateKey(value: EthereumPrivateKey | string): value is EthereumPrivateKey {
  return isValidPrivate(toEthBuffer(addPrefixToHex(value)))
}

export function isValidEthereumSignature(
  value: EthereumSignature | string | ECDSASignature,
): value is EthereumSignature {
  let signature: ECDSASignature
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  if (isString(value)) {
    signature = JSON.parse(value)
  } else {
    signature = value
  }
  const { v, r, s } = signature
  return isValidSignature(v, r, s)
}

// For a given private key, pr, the Ethereum address A(pr) (a 160-bit value) to which it corresponds is defined as the right most 160-bits of the Keccak hash of the corresponding ECDSA public key.
export function isValidEthereumAddress(value: string | Buffer | EthereumAddress): boolean {
  if (typeof value === 'string') return isValidAddress(value)
  return true
}

/** Accepts hex string checks if a valid ethereum data hex
 *  Returns EthereumPublicKey with prefix
 */
export function toEthereumTxData(value: string | Buffer): EthereumTxData {
  if (isValidEthereumTxData(value)) {
    return typeof value === 'string' ? (addPrefixToHex(value) as EthereumTxData) : (value as EthereumTxData)
  }
  throw new Error(`Not a valid ethereum public key:${value}.`)
}

/** Accepts hex string checks if a valid ethereum public key
 *  Returns EthereumPublicKey with prefix
 */
export function toEthereumPublicKey(value: string): EthereumPublicKey {
  if (isValidEthereumPublicKey(value)) {
    return addPrefixToHex(value) as EthereumPublicKey
  }
  throw new Error(`Not a valid ethereum public key:${value}.`)
}

/** Accepts hex string checks if a valid ethereum private key
 *  Returns EthereumPrivateKey with prefix
 */
export function toEthereumPrivateKey(value: string): EthereumPrivateKey {
  if (isValidEthereumPrivateKey(value)) {
    return addPrefixToHex(value) as EthereumPrivateKey
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
    return addPrefixToHex(value) as EthereumAddress
  }
  throw new Error(`Not a valid ethereum address:${value}.`)
}
