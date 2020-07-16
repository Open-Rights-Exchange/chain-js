import scrypt from 'scrypt-async'
import * as sha512 from 'js-sha512'
import * as ed25519Crypto from '../../../crypto/ed25519Crypto'
import { hexStringToByteArray, isNullOrEmpty } from '../../../helpers'
import { ALGORAND_PASSWORD_ENCRYPTION_CONSTANTS } from '../algoConstants'
import { AlgorandPublicKey, AlgorandSignature, AlgorandPrivateKey } from '../models'

/** Converts a password string using salt to a key(32 byte array)
 * The scrypt password-base key derivation function (pbkdf) is an algorithm converts human readable passwords into fixed length arrays of bytes.
 * It can then be used as a key for symmetric block ciphers and private keys
 */
export function calculatePasswordByteArray(password: string, salt: string = ''): Uint8Array {
  let passwordArray
  scrypt(password, salt, ALGORAND_PASSWORD_ENCRYPTION_CONSTANTS, function(derivedKey: any) {
    passwordArray = derivedKey
  })
  return passwordArray
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

/** Return sha512 hash of an array */
export function genericHash(arr: Uint8Array) {
  return sha512.sha512_256.array(arr)
}

export function isValidAlgorandPublicKey(value: string | AlgorandPublicKey): value is AlgorandPublicKey {
  if (!value) return false
  return ed25519Crypto.isValidPublicKey(hexStringToByteArray(value))
}

export function isValidAlgorandPrivateKey(value: string): value is AlgorandPrivateKey {
  return ed25519Crypto.isValidPrivateKey(hexStringToByteArray(value))
}

// ALGO TODO: add validation rule for signature
export function isValidAlgorandSignature(signature: string): boolean {
  if (!isNullOrEmpty(signature)) {
    return true
  }
  return false
}

/** Accepts hex string checks if a valid algorand private key
 *  Returns AlgorandPrivatekey
 */
export function toAlgorandPrivateKey(value: string): AlgorandPrivateKey {
  if (isValidAlgorandPrivateKey(value)) {
    return value as AlgorandPrivateKey
  }
  throw new Error(`Not a valid algorand private key:${value}.`)
}

/** Accepts hex string checks if a valid algorand public key
 *  Returns AlgorandPublicKey
 */
export function toAlgorandPublicKey(value: string): AlgorandPublicKey {
  if (isValidAlgorandPublicKey(value)) {
    return value as AlgorandPublicKey
  }
  throw new Error(`Not a valid algorand public key:${value}.`)
}

export function toAlgorandSignature(value: string): AlgorandSignature {
  if (isValidAlgorandSignature(value)) {
    return value as AlgorandSignature
  }
  throw new Error(`Not a valid algorand signature:${value}.`)
}
