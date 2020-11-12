/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Wallet from 'ethereumjs-wallet'
import { bufferToHex, ecsign, ecrecover, publicToAddress } from 'ethereumjs-util'
import EthCrypto from 'eth-crypto'
import * as Asymmetric from '../../crypto/asymmetric'
import { AesCrypto, CryptoHelpers } from '../../crypto'
import { toBuffer, notImplemented } from '../../helpers'
import { EthereumAddress, EthereumPrivateKey, EthereumPublicKey, EthereumSignature } from './models'
import { toEthBuffer, toEthereumPublicKey, toEthereumSignature } from './helpers'
import { EncryptedDataString } from '../../models'
import { ensureEncryptedValueIsObject } from '../../crypto/cryptoHelpers'

const ETHEREUM_ASYMMETRIC_SCHEME_NAME = 'chainjs.ethereum.secp256k1'

// eslint-disable-next-line prefer-destructuring
export const defaultIter = AesCrypto.defaultIter
// eslint-disable-next-line prefer-destructuring
export const defaultMode = AesCrypto.defaultMode

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isEncryptedDataString(value: string): value is EncryptedDataString {
  return CryptoHelpers.isEncryptedDataString(value)
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toEncryptedDataString(value: any): EncryptedDataString {
  return CryptoHelpers.toEncryptedDataString(value)
}

/** Decrypts the encrypted value using a password, and optional salt using AES algorithm and SHA256 hash function
 * The encrypted value is either a stringified JSON object or a JSON object */
export function decryptWithPassword(
  encrypted: EncryptedDataString | any,
  password: string,
  options: AesCrypto.AesEncryptionOptions,
): string {
  return AesCrypto.decryptWithPassword(encrypted, password, options)
}

/** Encrypts a string using a password and optional salt */
export function encryptWithPassword(
  unencrypted: string,
  password: string,
  options: AesCrypto.AesEncryptionOptions,
): EncryptedDataString {
  return AesCrypto.encryptWithPassword(unencrypted, password, options)
}

/** Encrypts a string using a public key into a stringified JSON object
 * The encrypted result can be decrypted with the matching private key */
export async function encryptWithPublicKey(
  unencrypted: string,
  publicKey: EthereumPublicKey,
  options: Asymmetric.Options,
): Promise<string> {
  const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, unencrypted)
  const encryptedToReturn = { ...encrypted, ...{ scheme: ETHEREUM_ASYMMETRIC_SCHEME_NAME } }
  return JSON.stringify(encryptedToReturn)
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(encrypted: string, privateKey: EthereumPrivateKey): Promise<string> {
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  return EthCrypto.decryptWithPrivateKey(privateKey, encryptedObject)
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
function encryptAccountPrivateKeysIfNeeded(keys: any, password: string, options: AesCrypto.AesEncryptionOptions) {
  const { privateKey, publicKey } = keys
  const encryptedKeys = {
    privateKey: isEncryptedDataString(privateKey)
      ? privateKey
      : encryptWithPassword(privateKey, password, options).toString(),
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
  options: AesCrypto.AesEncryptionOptions,
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
