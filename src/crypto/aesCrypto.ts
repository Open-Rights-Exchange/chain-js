import sjcl, { BitArray } from 'sjcl'
import { isArray } from 'util'
import { EncryptedDataString } from '../models'
import { isAString, isAnObject } from '../helpers'

/** Encryption modes supported by crypto library (default is gcm) */
export enum EncryptionMode {
  Gcm = 'gcm',
  Ccm = 'ccm',
  Ocb2 = 'ocb2',
  Cbc = 'cbc',
}

/** Additional parameters for encryption/decryption - for SHA256 algorithm */
export type AesEncryptionOptions = {
  salt?: string
  iter?: number
  mode?: EncryptionMode
}

export type SjclCipherParams = {
  v?: number
  iter?: number
  ks?: number
  ts?: number
  mode?: string
  adata?: string
  cipher?: string
  salt?: BitArray | string
  iv?: BitArray
}

export const defaultIter = 1000000
export const defaultMode = EncryptionMode.Gcm

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
  if (isArray(value)) {
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

// decrypt and encrypt

// NOTE Passing in at least an empty string for the salt, will prevent cached keys, which can lead to false positives in the test suite
/** Derive the key used for encryption/decryption */
export function deriveKey(password: string, iter: number, salt: string = ''): sjcl.BitArray {
  const { key } = sjcl.misc.cachedPbkdf2(password, { iter, salt })
  return key
}

/** Decrypts the encrypted value with the derived key */
export function decryptWithKey(encrypted: EncryptedDataString | any, derivedKey: sjcl.BitArray): string {
  const encryptedAsObject = ensureEncryptedValueIsObject(encrypted)
  const encryptedDataString = JSON.stringify(encryptedAsObject)
  return sjcl.decrypt(derivedKey, encryptedDataString)
}

/** Decrypts the encrypted value using a password, and salt (and optional iter value)
 * Uses AES algorithm and SHA256 hash function
 * The encrypted value is either a stringified JSON object or a JSON object */
export function decrypt(
  encrypted: EncryptedDataString | any,
  password: string,
  options?: AesEncryptionOptions,
): string {
  const { salt } = options || {}
  const parsedObject = ensureEncryptedValueIsObject(encrypted)

  // get iter from encrypted string (can be overridden by options)
  const iter = options?.iter || parsedObject?.iter

  return decryptWithKey(encrypted, deriveKey(password, iter, salt))
}

/** Encrypts the private key with the derived key  */
export function encryptWithKey(
  unencrypted: string,
  cryptoParams: SjclCipherParams,
  derivedKey: sjcl.BitArray,
): sjcl.SjclCipherEncrypted {
  const params = { ...cryptoParams } as sjcl.SjclCipherEncryptParams
  const encrypted = ensureEncryptedValueIsObject(sjcl.encrypt(derivedKey, unencrypted, params) as any)
  return encrypted
}

/** Encrypts a string using a password and optional salt */
export function encrypt(unencrypted: string, password: string, options?: AesEncryptionOptions): EncryptedDataString {
  const { iter = defaultIter, mode = defaultMode, salt } = options || {}
  const cryptoParams = { mode, iter } as SjclCipherParams
  return toEncryptedDataString(
    JSON.stringify(encryptWithKey(unencrypted, cryptoParams, deriveKey(password, iter, salt))),
  )
}
