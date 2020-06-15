import * as nacl from 'tweetnacl'
import { decodeBase64, decodeUTF8 } from 'tweetnacl-util'
import { EncryptedDataString } from '../models'
import { isAString } from '../helpers'

const newNonce = () => nacl.randomBytes(nacl.secretbox.nonceLength)

export type ed25519PrivateKey = Uint8Array

export type ed25519Signature = Uint8Array

export type ed25519PublicKey = Uint8Array

export type ed25519KeyPair = {
  publicKey: ed25519PublicKey
  secretKey: ed25519PrivateKey
}

/** Verifies that the value is a valid, stringified encrypted object */
export function isEncryptedDataString(value: string): value is EncryptedDataString {
  if (!isAString(value)) return false
  // this is an oversimplified check just to prevent assigning a wrong string
  return value !== null
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toEncryptedDataString(value: any): EncryptedDataString {
  if (isEncryptedDataString(value)) {
    return value
  }
  throw new Error(`Not valid encrypted data string:${value}`)
}

/** Encrypts a string using a password and a nonce */
export function encrypt(unencrypted: string, password: string): Uint8Array {
  const keyUint8Array = decodeBase64(password)
  const nonce = newNonce()
  const messageUint8 = decodeUTF8(unencrypted)
  const box = nacl.secretbox(messageUint8, nonce, keyUint8Array)

  const fullMessage = new Uint8Array(nonce.length + box.length)
  fullMessage.set(nonce)
  fullMessage.set(box, nonce.length)

  return fullMessage
}

/** Decrypts the encrypted value using a password */
export function decrypt(encrypted: EncryptedDataString | any, password: string): Uint8Array {
  const keyUint8Array = decodeBase64(password)
  const messageWithNonceAsUint8Array = decodeBase64(encrypted)
  const nonce = messageWithNonceAsUint8Array.slice(0, nacl.secretbox.nonceLength)
  const message = messageWithNonceAsUint8Array.slice(nacl.secretbox.nonceLength, encrypted.length)

  const decrypted = nacl.secretbox.open(message, nonce, keyUint8Array)

  if (!decrypted) {
    throw new Error('Could not decrypt message')
  }

  return decrypted
}

export function getKeyPairFromPrivateKey(privateKey: ed25519PrivateKey): ed25519KeyPair {
  return nacl.sign.keyPair.fromSecretKey(privateKey)
}

/** Signs the message using the private key and returns a signature. */
export function sign(data: Uint8Array, privateKey: ed25519PrivateKey): ed25519Signature {
  return nacl.sign.detached(data, privateKey)
}

/** Verifies the signature for the message and returns true if verification succeeded or false if it failed. */
export function verify(data: Uint8Array, publicKey: ed25519PublicKey, signature: ed25519Signature): boolean {
  return nacl.sign.detached.verify(data, signature, publicKey)
}
