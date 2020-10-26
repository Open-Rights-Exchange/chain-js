/* eslint-disable new-cap */
import { SjclCipherEncryptParams } from '@aikon/sjcl'
import crypto from 'crypto'
import { throwNewError } from '../errors'
import * as Asymmetric from './asymmetric'

/** Additional parameters for encryption/decryption - for SHA256 algorithm */
export type EccEncryptionOptions = SjclCipherEncryptParams

/** Encrypts a string using a public key into a hex-encoded string
 * The encrypted result can be decrypted with the matching private key
 * The publicKeyBuffer parameter must be 65 byte uncompress public key encoded as a Buffer */
export function encryptWithPublicKey(
  unencrypted: string,
  publicKeyBuffer: Buffer,
  options: Asymmetric.Options,
): Asymmetric.EncryptedAsymmetric {
  if (publicKeyBuffer.length !== 65) {
    throwNewError('encryptWithPublicKey public key buffer must be 65 bytes. Cant encrypt using value provided')
  }
  const contentBuffer = Buffer.from(unencrypted)
  const encryptedObject = Asymmetric.encrypt(publicKeyBuffer, contentBuffer, options)
  return encryptedObject
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a hex-encoded string
 * ... and must have been encrypted with the public key that matches the private ley provided */
export function decryptWithPrivateKey(encrypted: Asymmetric.EncryptedAsymmetric, privateKeyBuffer: Buffer): string {
  const ecdh = crypto.createECDH('secp256k1')
  if (privateKeyBuffer.length !== 32) {
    throwNewError('decryptWithPrivateKey private key buffer must be 32 bytes. Cant decrypt using value provided')
  }
  ecdh.setPrivateKey(privateKeyBuffer)
  return Asymmetric.decrypt(ecdh, encrypted).toString()
}
