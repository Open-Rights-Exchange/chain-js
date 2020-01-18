import sjcl from 'sjcl'
import { EncryptedDataString } from './models'

/** Convert a string to a sjcl.BitArray */
export function stringToBitArray(value: string): sjcl.BitArray {
  return sjcl.codec.base64.toBits(value)
}

/** Convert sjcl.BitArray to a string */
export function bitArrayToString(value: sjcl.BitArray): string {
  return sjcl.codec.base64.fromBits(value)
}

// casting and type conversion

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isEncryptedDataString(value: string): value is EncryptedDataString {
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

/** Derive the key used for encryption/decryption */
export function deriveKey(password: string, salt: string): string {
  // NOTE Passing in at least an empty string for the salt, will prevent cached keys, which can lead to false positives in the test suite
  const saltArray = stringToBitArray(salt || '')
  const params = { iter: 1000, salt: saltArray }
  const { key } = sjcl.misc.cachedPbkdf2(password, params)
  // convert the key:BitArray returned from cachedPbkdf2 into a string
  const keyString = bitArrayToString(key)
  return keyString
}

/** Decrypts the encrypted value with the derived key */
export function decryptWithKey(encrypted: EncryptedDataString, derivedKey: string): string {
  const parsedObject = JSON.parse(encrypted)
  const encryptedData = { ...parsedObject, mode: 'gcm' } as sjcl.SjclCipherEncrypted
  return sjcl.decrypt(derivedKey, JSON.stringify(encryptedData))
}

/** Decrypts the encrypted value using a password, and salt using AES algorithm and SHA256 hash function
 * The encrypted value is a stringified JSON object */
export function decrypt(encrypted: EncryptedDataString, password: string, salt: string): string {
  return decryptWithKey(encrypted, deriveKey(password, salt))
}

/** Encrypts the EOS private key with the derived key  */
export function encryptWithKey(unencrypted: string, derivedKey: string): sjcl.SjclCipherEncrypted {
  const params = { mode: 'gcm' } as sjcl.SjclCipherEncryptParams
  const encrypted = JSON.parse(sjcl.encrypt(derivedKey, unencrypted, params) as any)
  return encrypted
}

/** Encrypts a string using a password and salt */
export function encrypt(unencrypted: string, password: string, salt: string): EncryptedDataString {
  return toEncryptedDataString(JSON.stringify(encryptWithKey(unencrypted, deriveKey(password, salt))))
}
