/* eslint-disable new-cap */
import { SjclCipherEncryptParams } from '@aikon/sjcl'
import crypto, { ECDHKeyFormat } from 'crypto'
import { throwNewError } from '../errors'

/** Additional parameters for encryption/decryption - for SHA256 algorithm */
export type EccEncryptionOptions = SjclCipherEncryptParams

/** Generates Ephem Keypair and sharedSecret */
export function generateEphemPublicKeyAndSharedSecret(
  publicKey: NodeJS.ArrayBufferView,
  curveType: string,
  keyFormat: ECDHKeyFormat,
) {
  if ((publicKey as Buffer).length !== 65) {
    throwNewError('encryptWithPublicKey public key buffer must be 65 bytes. Cant encrypt using value provided')
  }
  const ecdh = crypto.createECDH(curveType)
  const encodedEphemPublicKey = ecdh.generateKeys(null, keyFormat)
  const sharedSecret = ecdh.computeSecret(publicKey)
  return { ephemPublicKey: encodedEphemPublicKey, sharedSecret }
}

/** Generates sharedSecret using ephemPublicKey */
export function generateSharedSecret(
  publicKey: NodeJS.ArrayBufferView,
  secretKey: NodeJS.ArrayBufferView,
  curveType: string,
) {
  if ((publicKey as Buffer).length !== 65) {
    throwNewError('encryptWithPublicKey public key buffer must be 65 bytes. Cant encrypt using value provided')
  }
  const ecdh = crypto.createECDH(curveType)
  ecdh.setPrivateKey(secretKey)
  const sharedSecret = ecdh.computeSecret(publicKey)
  return sharedSecret
}
