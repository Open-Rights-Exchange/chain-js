import nacl from 'tweetnacl'
import scrypt from 'scrypt-async'
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util'
import { ModelsCryptoSymmetric } from '../models'
import { isAString, isNullOrEmpty, hexStringToByteArray, byteArrayToHexString } from '../helpers'
import {
  Ed25519KeyPair,
  Ed25519PasswordEncryptionOptions,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  Ed25519Signature,
} from './ed25519CryptoModels'

export * from './ed25519CryptoModels'

const newNonce = () => nacl.randomBytes(nacl.secretbox.nonceLength)

/** Options used by scrypt library to derive a key from password and salt */
const passwordEncryptionDefaults: Ed25519PasswordEncryptionOptions = {
  salt: '',
  N: 65536,
  r: 8,
  p: 1,
  dkLen: 32,
  encoding: 'binary',
}

/** Verifies that the value is a valid, stringified encrypted object */
export function isEncryptedDataString(value: string): value is ModelsCryptoSymmetric.EncryptedDataString {
  if (!isAString(value)) return false
  // this is an oversimplified check just to prevent assigning a wrong string
  return value !== null
}

/** Ensures that the value confirms to a well-formed, stringified JSON Encrypted Object */
export function toEncryptedDataString(value: any): ModelsCryptoSymmetric.EncryptedDataString {
  if (isEncryptedDataString(value)) {
    return value
  }
  throw new Error(`Not valid encrypted data string:${value}`)
}

/** Converts a password string using salt to a key(32 byte array)
 * The scrypt password-base key derivation function (pbkdf) is an algorithm converts human readable passwords into fixed length arrays of bytes.
 * It can then be used as a key for symmetric block ciphers and private keys
 */
export function calculatePasswordByteArray(password: string, options: Ed25519PasswordEncryptionOptions): string {
  let passwordArray
  const { salt } = options
  // Use defaults for options not provided
  const encryptionOptions = {
    N: options?.N || passwordEncryptionDefaults.N,
    r: options?.r || passwordEncryptionDefaults.r,
    p: options?.p || passwordEncryptionDefaults.p,
    dkLen: options?.dkLen || passwordEncryptionDefaults.dkLen,
    encoding: options?.encoding || passwordEncryptionDefaults.encoding,
  }
  scrypt(password, salt, encryptionOptions, (derivedKey: any) => {
    passwordArray = derivedKey
  })
  return byteArrayToHexString(passwordArray)
}

/** Encrypts a string using a password and a nonce
 *  Password is a base64 encoded string
 */
export function encrypt(unencrypted: string, passwordKey: string): string {
  const keyUint8Array = hexStringToByteArray(passwordKey)
  const nonce = newNonce()
  const messageUint8 = decodeUTF8(unencrypted)
  const box = nacl.secretbox(messageUint8, nonce, keyUint8Array)

  const fullMessage = new Uint8Array(nonce.length + box.length)
  fullMessage.set(nonce)
  fullMessage.set(box, nonce.length)

  return encodeBase64(fullMessage)
}

/** Decrypts the encrypted value using a password
 * Password is a base64 encoded string
 */
export function decrypt(encrypted: ModelsCryptoSymmetric.EncryptedDataString | any, passwordKey: string): string {
  const keyUint8Array = hexStringToByteArray(passwordKey)
  const messageWithNonceAsUint8Array = decodeBase64(encrypted)
  const nonce = messageWithNonceAsUint8Array.slice(0, nacl.secretbox.nonceLength)
  const message = messageWithNonceAsUint8Array.slice(nacl.secretbox.nonceLength, messageWithNonceAsUint8Array.length)

  const decrypted = nacl.secretbox.open(message, nonce, keyUint8Array)
  if (!decrypted) {
    throw new Error('Could not decrypt message')
  }

  return encodeUTF8(decrypted)
}

export function getKeyPairFromPrivateKey(privateKey: Ed25519PrivateKey): Ed25519KeyPair {
  return nacl.sign.keyPair.fromSecretKey(privateKey)
}

/** Signs the message using the private key and returns a signature. */
export function sign(value: Uint8Array, privateKey: Ed25519PrivateKey): Ed25519Signature {
  return nacl.sign.detached(value, privateKey)
}

/** Verifies the signature for the message and returns true if verification succeeded or false if it failed. */
export function verify(value: Uint8Array, publicKey: Ed25519PublicKey, signature: Ed25519Signature): boolean {
  return nacl.sign.detached.verify(value, signature, publicKey)
}

export function isValidPublicKey(value: Uint8Array): boolean {
  if (isNullOrEmpty(value)) return false
  return value.length === 32
}

export function isValidPrivateKey(value: Uint8Array): boolean {
  if (isNullOrEmpty(value)) return false
  return value.length === 64
}
