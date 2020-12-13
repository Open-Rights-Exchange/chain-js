import sjcl, { BitArray } from '@aikon/sjcl'
import { AsymEncryptedDataString, EncryptedDataString } from '../models'
import { isAString, isAnObject } from '../helpers'

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isEncryptedDataString(value: string): value is EncryptedDataString {
  if (!isAString(value)) return false
  // this is an oversimplified check just to prevent assigning a wrong string
  return value.match(/^\{.+iv.+iter.+ks.+ts.+mode.+adata.+cipher.+ct.+\}$/i) !== null
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toEncryptedDataString(value: any): EncryptedDataString {
  if (isEncryptedDataString(value)) {
    return value
  }
  throw new Error(`Not valid encrypted data string:${value}`)
}

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isAsymEncryptedDataString(value: string): value is AsymEncryptedDataString {
  if (!isAString(value)) return false
  // this is an oversimplified check just to prevent assigning a wrong string
  return value.match(/^.+publicKey.+ephemPublicKey.+ciphertext.+mac.+scheme.+$/i) !== null
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toAsymEncryptedDataString(value: any): AsymEncryptedDataString {
  if (isAsymEncryptedDataString(value)) {
    return value
  }
  throw new Error(`Not valid asymmetric encrypted data string:${value}`)
}

/** Convert a base64 string to a sjcl.BitArray */
export function base64StringToBitArray(value: string | BitArray): sjcl.BitArray {
  if (Array.isArray(value)) {
    return value
  }
  return sjcl.codec.base64.toBits(value)
}

/** Convert sjcl.BitArray to a base64 string */
export function bitArrayToBase64String(value: sjcl.BitArray | string): string {
  if (isAString(value)) {
    return value as string
  }
  return sjcl.codec.base64.fromBits(value as BitArray)
}

/** Convert a hex string to a sjcl.BitArray */
export function hexStringToBitArray(value: string | BitArray): sjcl.BitArray {
  if (Array.isArray(value)) {
    return value
  }
  return sjcl.codec.hex.toBits(value)
}

/** Convert sjcl.BitArray to a hex string */
export function bitArrayToHexString(value: sjcl.BitArray | string): string {
  if (isAString(value)) {
    return value as string
  }
  return sjcl.codec.hex.fromBits(value as BitArray)
}

/** Convert a utf8 string to a sjcl.BitArray */
export function utf8StringToBitArray(value: string | BitArray): sjcl.BitArray {
  if (Array.isArray(value)) {
    return value
  }
  return sjcl.codec.utf8String.toBits(value)
}

/** Convert sjcl.BitArray to a utf8 string */
export function bitArrayToUtf8String(value: sjcl.BitArray | string): string {
  if (isAString(value)) {
    return value as string
  }
  return sjcl.codec.utf8String.fromBits(value as BitArray)
}

/** If the encrypted param isn't already a JSON object, parse the stringfied value into one
 *  Returns a JSON object */
export function ensureEncryptedValueIsObject(encrypted: EncryptedDataString | any) {
  if (isAnObject(encrypted)) {
    return encrypted
  }
  return JSON.parse(encrypted)
}
