/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Wallet from 'ethereumjs-wallet'
import { bufferToHex, ecsign, ecrecover, publicToAddress } from 'ethereumjs-util'
import secp256k1 from 'secp256k1'
import * as Asymmetric from '../../crypto/asymmetric'
import { AesCrypto, CryptoHelpers } from '../../crypto'
import { toBuffer, notImplemented, removeHexPrefix, byteArrayToHexString, hexStringToByteArray } from '../../helpers'
import { EthereumAddress, EthereumKeyPair, EthereumPrivateKey, EthereumPublicKey, EthereumSignature } from './models'
import { toEthBuffer, toEthereumPublicKey, toEthereumSignature } from './helpers'
import { AsymEncryptedDataString, EncryptedDataString } from '../../models'
import { ensureEncryptedValueIsObject, toAsymEncryptedDataString } from '../../crypto/cryptoHelpers'
import * as AsymmetricHelpers from '../../crypto/asymmetricHelpers'

const ETHEREUM_ASYMMETRIC_SCHEME_NAME = 'asym.chainjs.secp256k1.ethereum'

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

/** get uncompressed public key from EthereumPublicKey */
export function uncompressPublicKey(publicKey: EthereumPublicKey): string {
  // if already decompressed an not has trailing 04
  const cleanedPublicKey = removeHexPrefix(publicKey)
  const testBuffer = Buffer.from(cleanedPublicKey, 'hex')
  const prefixedPublicKey = testBuffer.length === 64 ? `04${cleanedPublicKey}` : cleanedPublicKey
  const uncompressedPublicKey = byteArrayToHexString(
    secp256k1.publicKeyConvert(hexStringToByteArray(prefixedPublicKey), false),
  )
  return uncompressedPublicKey
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
  options: Asymmetric.EciesOptions,
): Promise<AsymEncryptedDataString> {
  const publicKeyUncompressed = uncompressPublicKey(publicKey) // should be hex string
  const useOptions = {
    ...options,
    curveType: Asymmetric.EciesCurveType.Secp256k1,
    scheme: ETHEREUM_ASYMMETRIC_SCHEME_NAME,
  }
  const response = Asymmetric.encryptWithPublicKey(publicKeyUncompressed, unencrypted, useOptions)
  return toAsymEncryptedDataString(JSON.stringify(response))
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: AsymEncryptedDataString | Asymmetric.EncryptedAsymmetric,
  privateKey: EthereumPrivateKey,
  options: Asymmetric.EciesOptions,
): Promise<string> {
  const useOptions = { ...options, curveType: Asymmetric.EciesCurveType.Secp256k1 }
  const privateKeyHex = removeHexPrefix(privateKey)
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  return Asymmetric.decryptWithPrivateKey(encryptedObject, privateKeyHex, useOptions)
}

/** Encrypts a string using multiple assymmetric encryptions with multiple public keys - one after the other
 *  calls a helper function to perform the iterative wrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to encryptWithPublicKey
 *  The result is stringified JSON object including an array of encryption results with the last one including the final cipertext
 *  Encrypts using publicKeys in the order they appear in the array */
export async function encryptWithPublicKeys(
  unencrypted: string,
  publicKeys: EthereumPublicKey[],
  options?: Asymmetric.EciesOptions,
): Promise<AsymEncryptedDataString> {
  return toAsymEncryptedDataString(
    await AsymmetricHelpers.encryptWithPublicKeys(encryptWithPublicKey, unencrypted, publicKeys, options),
  )
}

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
 *  calls a helper function to perform the iterative unwrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to decryptWithPrivateKey
 *  Decrypts using privateKeys that match the publicKeys provided in encryptWithPublicKeys() - provide the privateKeys in same order
 *  The result is the decrypted string */
export async function decryptWithPrivateKeys(
  encrypted: AsymEncryptedDataString,
  privateKeys: EthereumPublicKey[],
): Promise<string> {
  return AsymmetricHelpers.decryptWithPrivateKeys(decryptWithPrivateKey, encrypted, privateKeys, {})
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
function encryptAccountPrivateKeysIfNeeded(
  keys: EthereumKeyPair,
  password: string,
  options: AesCrypto.AesEncryptionOptions,
): EthereumKeyPair {
  // encrypt if not already encrypted
  const privateKey = isEncryptedDataString(keys?.privateKey)
    ? keys?.privateKey
    : encryptWithPassword(keys?.privateKey, password, options)
  const encryptedKeys: EthereumKeyPair = {
    privateKey,
    publicKey: keys?.publicKey,
  }
  return encryptedKeys
}

/** Generates and returns a new public/private key pair */
export async function generateKeyPair(): Promise<EthereumKeyPair> {
  const wallet = Wallet.generate()
  const privateKey: EthereumPrivateKey = wallet.getPrivateKeyString()
  const publicKey: EthereumPublicKey = wallet.getPublicKeyString()
  const keys: EthereumKeyPair = { privateKey, publicKey }
  return keys
}

/** Generates new public and private key pair
 * Encrypts the private key using password and optional salt
 */
export async function generateNewAccountKeysAndEncryptPrivateKeys(
  password: string,
  overrideKeys: any,
  options: AesCrypto.AesEncryptionOptions,
): Promise<EthereumKeyPair> {
  const keys = await generateKeyPair()
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
