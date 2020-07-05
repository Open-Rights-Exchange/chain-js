import { decodeBase64, decodeUTF8 } from 'tweetnacl-util'
import * as sha512 from 'js-sha512'
import { isNullOrEmpty } from '../../../helpers'
import { AlgorandPublicKey, AlgorandSignature, AlgorandPrivateKey, AlgorandRawPrivateKey } from '../models'
import * as ed25519Crypto from '../../../crypto/ed25519Crypto'

export function isValidAlgorandPublicKey(value: string | AlgorandPublicKey): value is AlgorandPublicKey {
  if (!value) return false
  return ed25519Crypto.isValidPublicKey(decodeBase64(value))
}

export function isValidAlgorandPrivateKey(value: string): value is AlgorandPrivateKey {
  return ed25519Crypto.isValidPrivateKey(decodeBase64(value))
}

/** Accepts hex string checks if a valid algorand private key
 *  Returns AlgorandPrivatekey (base64 encoded)
 */
export function toAlgorandPrivateKey(value: string): AlgorandPrivateKey {
  if (isValidAlgorandPrivateKey(value)) {
    return value as AlgorandPrivateKey
  }
  throw new Error(`Not a valid algorand private key:${value}.`)
}

export function toRawAlgorandPrivateKey(value: AlgorandPrivateKey): AlgorandRawPrivateKey {
  return decodeBase64(value)
}

/** Converts a string to an Uint8 array */
export function toUint8Array(encodedString: string) {
  return decodeUTF8(encodedString)
}

/** Return sha512 hash of an array */
export function genericHash(arr: Uint8Array) {
  return sha512.sha512_256.array(arr)
}

/**
 * ConcatArrays takes two array and returns a joint Uint8 array of both
 */
export function concatArrays(a: any, b: any): Uint8Array {
  const c = new Uint8Array(a.length + b.length)
  c.set(a)
  c.set(b, a.length)
  return c
}

// ALGO TODO: add validation rule for signature
export function isValidAlgorandSignature(signature: AlgorandSignature): boolean {
  if (!isNullOrEmpty(signature)) {
    return true
  }
  return false
}
