import sjcl, { BitArray } from '@aikon/sjcl'
import { EncryptedDataString } from '../models'
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

/** Convert a string to a sjcl.BitArray */
export function stringToBitArray(value: string | BitArray): sjcl.BitArray {
  if (Array.isArray(value)) {
    return value
  }
  return sjcl.codec.base64.toBits(value)
}

/** Convert sjcl.BitArray to a string */
export function bitArrayToString(value: sjcl.BitArray | string): string {
  if (isAString(value)) {
    return value as string
  }
  return sjcl.codec.base64.fromBits(value as BitArray)
}

/** If the encrypted param isn't already a JSON object, parse the stringfied value into one
 *  Returns a JSON object */
export function ensureEncryptedValueIsObject(encrypted: EncryptedDataString | any) {
  if (isAnObject(encrypted)) {
    return encrypted
  }
  return JSON.parse(encrypted)
}
