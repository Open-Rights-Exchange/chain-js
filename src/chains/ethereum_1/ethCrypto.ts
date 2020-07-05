/* eslint-disable @typescript-eslint/no-unused-vars */
import Wallet from 'ethereumjs-wallet'
import { bufferToHex, ecsign, ecrecover, publicToAddress } from 'ethereumjs-util'
import * as aesCrypto from '../../crypto/aesCrypto'
import { toBuffer, notImplemented } from '../../helpers'
import { throwNewError } from '../../errors'
import { EncryptionOptions, EthereumAddress, EthereumPrivateKey, EthereumPublicKey, EthereumSignature } from './models'
// eslint-disable-next-line
import { toEthBuffer, toEthereumPublicKey, toEthereumSignature } from './helpers'
import { EncryptedDataString } from '../../models'

// eslint-disable-next-line prefer-destructuring
export const defaultIter = aesCrypto.defaultIter
// eslint-disable-next-line prefer-destructuring
export const defaultMode = aesCrypto.defaultMode

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isEncryptedDataString(value: string): value is EncryptedDataString {
  return aesCrypto.isEncryptedDataString(value)
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toEncryptedDataString(value: any): EncryptedDataString {
  return aesCrypto.toEncryptedDataString(value)
}

/** Decrypts the encrypted value using a password, and optional salt using AES algorithm and SHA256 hash function
 * The encrypted value is either a stringified JSON object or a JSON object */
export function decrypt(encrypted: EncryptedDataString | any, password: string, options: EncryptionOptions): string {
  return aesCrypto.decrypt(encrypted, password, options)
}

/** Encrypts a string using a password and optional salt */
export function encrypt(unencrypted: string, password: string, options: EncryptionOptions): EncryptedDataString {
  return aesCrypto.encrypt(unencrypted, password, options)
}

/** Signs data with private key */
export function sign(data: string | Buffer, privateKey: string): EthereumSignature {
  const dataBuffer = toEthBuffer(data)
  const keyBuffer = toBuffer(privateKey, 'hex')
  return toEthereumSignature(ecsign(dataBuffer, keyBuffer))
}

/** Returns public key from ethereum signature */
export function getEthereumPublicKeyFromSignature(
  signature: EthereumSignature,
  data: string | Buffer,
  encoding: string,
): EthereumPublicKey {
  const { v, r, s } = signature
  return toEthereumPublicKey(ecrecover(toEthBuffer(data), v, r, s).toString())
}

/** Returns public key from ethereum address */
export function getEthereumAddressFromPublicKey(publicKey: EthereumPublicKey): EthereumAddress {
  return bufferToHex(publicToAddress(toEthBuffer(publicKey)))
}

/** Replaces unencrypted privateKey in keys object
 *  Encrypts key using password and optional salt */
function encryptAccountPrivateKeysIfNeeded(keys: any, password: string, options: EncryptionOptions) {
  const { privateKey, publicKey } = keys
  const encryptedKeys = {
    privateKey: isEncryptedDataString(privateKey) ? privateKey : encrypt(privateKey, password, options).toString(),
    publicKey,
  }
  return encryptedKeys
}

/** Generates new public and private key pair
 * Encrypts the private key using password and optional salt
 */
export function generateNewAccountKeysAndEncryptPrivateKeys(
  password: string,
  overrideKeys: any,
  options: EncryptionOptions,
): any {
  const wallet = Wallet.generate()
  const privateKey: EthereumPrivateKey = wallet.getPrivateKeyString()
  const publicKey: EthereumPublicKey = wallet.getPublicKeyString()
  const keys = { privateKey, publicKey }
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password, options)
  return encryptedKeys
}

// TODO: implement using web3 method?
/** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
export function verifySignedWithPublicKey(
  publicKey: string | Buffer,
  data: string | Buffer,
  encoding: string,
): boolean {
  notImplemented()
  return null
}
