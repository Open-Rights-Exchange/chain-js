import sjcl from 'sjcl'
import { EncryptedDataString } from './models'

export function stringToBitArray(value: string): sjcl.BitArray {
  return sjcl.codec.base64.toBits(value)
}

export function bitArrayToString(value: sjcl.BitArray): string {
  return sjcl.codec.base64.fromBits(value)
}

// Derive the key used for encryption/decryption
export function deriveKey(password: string, salt: string): string {
  // NOTE Passing in at least an empty string for the salt, will prevent cached keys, which can lead to false positives in the test suite
  const saltArray = stringToBitArray(salt || '')
  const params = { iter: 1000, salt: saltArray }
  const { key } = sjcl.misc.cachedPbkdf2(password, params)
  // convert the key:BitArray returned from cachedPbkdf2 into a string
  const keyString = bitArrayToString(key)
  return keyString
}

// Decrypts the encrypted value with the derived key
export function decryptWithKey(encrypted: string, derivedKey: string): string {
  const parsedString = JSON.parse(JSON.parse(encrypted))
  const encryptedData = { ...parsedString, mode: 'gcm' } as sjcl.SjclCipherEncrypted
  return sjcl.decrypt(derivedKey, JSON.stringify(encryptedData))
}

/** Decrypts the encrypted value using a password, and salt using AES algorithm and SHA256 hash function
 * The encrypted value is a stringified JSON object */
export function decrypt(encrypted: string, password: string, salt: string): string {
  return decryptWithKey(encrypted, deriveKey(password, salt))
}

// Encrypts the EOS private key with the derived key
export function encryptWithKey(unencrypted: string, derivedKey: string): sjcl.SjclCipherEncrypted {
  const params = { mode: 'gcm' } as sjcl.SjclCipherEncryptParams
  const encrypted = sjcl.encrypt(derivedKey, unencrypted, params)
  return encrypted
}

// Encrypts a string using a password and salt
export function encrypt(unencrypted: string, password: string, salt: string): string {
  return JSON.stringify(encryptWithKey(unencrypted, deriveKey(password, salt)))
}

// casting and type conversion

export function isEncryptedDataString(value: string): value is EncryptedDataString {
  // this is an oversimplified check just to prevent assigning a wrong string
  return value.match(/^"\{.+iv.+iter.+ks.+ts.+mode.+adata.+cipher.+ct.+\}"$/i) !== null
}

export function toEncryptedDataString(data: string): EncryptedDataString {
  if (isEncryptedDataString(data)) {
    return data
  }
  throw new Error(`Not valid encrypted data string:${data}.`)
}
