import { isValidAddress } from 'algosdk'
import { decodeUTF8 } from 'tweetnacl-util'
import * as sha512 from 'js-sha512'
import { AlgorandPublicKey } from '../models/cryptoModels'
import * as ed25519Crypto from '../../../crypto/ed25519Crypto'

export function isValidAlgorandPublicKey(value: string | AlgorandPublicKey): value is AlgorandPublicKey {
  if (!value) return false
  return ed25519Crypto.isValidPublicKey(decodeUTF8(value))
}

export function isValidAlgorandAddress(address: string): boolean {
  return isValidAddress(address)
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
