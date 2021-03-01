import sjcl, { BitArray } from '@aikon/sjcl'
import { EncryptedDataString } from './genericCryptoModels'
import { isAString, isAnObject, jsonParseAndRevive } from '../helpers'

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
  return jsonParseAndRevive(encrypted)
}
