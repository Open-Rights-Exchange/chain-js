/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Wallet from 'ethereumjs-wallet'
import { bufferToHex, ecsign, ecrecover, publicToAddress, keccak } from 'ethereumjs-util'
import secp256k1 from 'secp256k1'
import { AesCrypto, Asymmetric } from '../../crypto'
import {
  bufferToHexString,
  byteArrayToHexString,
  convertUtf8OrHexStringToBuffer,
  ensureHexPrefix,
  ensureHexPrefixForPublicKey,
  hexStringToByteArray,
  removeHexPrefix,
} from '../../helpers'
import {
  EthereumAddress,
  EthereumKeyPair,
  EthereumPrivateKey,
  EthereumPublicKey,
  EthereumSignature,
  EthereumSignatureNative,
} from './models'
import { toEthBuffer, toEthereumAddress, toEthereumPublicKey, toEthereumSignatureNative } from './helpers'
import { ensureEncryptedValueIsObject } from '../../crypto/genericCryptoHelpers'
import * as AsymmetricHelpers from '../../crypto/asymmetricHelpers'
import { AsymmetricScheme } from '../../crypto/asymmetricModels'

// eslint-disable-next-line prefer-destructuring
export const defaultIter = AesCrypto.defaultIter
// eslint-disable-next-line prefer-destructuring
export const defaultMode = AesCrypto.defaultMode

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isSymEncryptedDataString(value: string): value is AesCrypto.AesEncryptedDataString {
  return AesCrypto.isAesEncryptedDataString(value)
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toSymEncryptedDataString(value: any): AesCrypto.AesEncryptedDataString {
  return AesCrypto.toAesEncryptedDataString(value)
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
  encrypted: AesCrypto.AesEncryptedDataString | any,
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
): AesCrypto.AesEncryptedDataString {
  return AesCrypto.encryptWithPassword(unencrypted, password, options)
}

/** Encrypts a string using a public key into a stringified JSON object
 * The encrypted result can be decrypted with the matching private key */
export async function encryptWithPublicKey(
  unencrypted: string,
  publicKey: EthereumPublicKey,
  options: Asymmetric.EciesOptions,
): Promise<Asymmetric.AsymmetricEncryptedDataString> {
  const publicKeyUncompressed = uncompressPublicKey(publicKey) // should be hex string
  const useOptions = {
    ...options,
    curveType: Asymmetric.EciesCurveType.Secp256k1,
    scheme: AsymmetricScheme.ETHEREUM_ASYMMETRIC_SCHEME_NAME,
  }
  const response = Asymmetric.encryptWithPublicKey(publicKeyUncompressed, unencrypted, useOptions)
  return Asymmetric.toAsymEncryptedDataString(JSON.stringify(response))
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: Asymmetric.AsymmetricEncryptedDataString | Asymmetric.AsymmetricEncryptedData,
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
): Promise<Asymmetric.AsymmetricEncryptedDataString> {
  return Asymmetric.toAsymEncryptedDataString(
    await AsymmetricHelpers.encryptWithPublicKeys(encryptWithPublicKey, unencrypted, publicKeys, options),
  )
}

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
 *  calls a helper function to perform the iterative unwrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to decryptWithPrivateKey
 *  Decrypts using privateKeys that match the publicKeys provided in encryptWithPublicKeys() - provide the privateKeys in same order
 *  The result is the decrypted string */
export async function decryptWithPrivateKeys(
  encrypted: Asymmetric.AsymmetricEncryptedDataString,
  privateKeys: EthereumPublicKey[],
  options?: any,
): Promise<string> {
  return AsymmetricHelpers.decryptWithPrivateKeys(decryptWithPrivateKey, encrypted, privateKeys, options)
}

/** Signs data with private key */
export function sign(data: string | Buffer, privateKey: string): EthereumSignatureNative {
  const dataBuffer = convertUtf8OrHexStringToBuffer(data)
  const keyBuffer = toEthBuffer(ensureHexPrefix(privateKey))
  const dataHash = keccak(dataBuffer)
  return toEthereumSignatureNative(ecsign(dataHash, keyBuffer))
}

/** Returns public key from ethereum signature */
export function getEthereumPublicKeyFromSignature(
  signature: EthereumSignatureNative,
  data: string | Buffer,
  encoding: string,
): EthereumPublicKey {
  const { v, r, s } = signature
  const dataHash = keccak(convertUtf8OrHexStringToBuffer(data))
  return toEthereumPublicKey(bufferToHexString(ecrecover(toEthBuffer(dataHash), v, r, s)))
}

/** Returns public key from ethereum address */
export function getEthereumAddressFromPublicKey(publicKey: EthereumPublicKey): EthereumAddress {
  return toEthereumAddress(bufferToHex(publicToAddress(toEthBuffer(publicKey))))
}

/** Adds privateKeyEncrypted if missing by encrypting privateKey (using password) */
function encryptAccountPrivateKeysIfNeeded(
  keys: EthereumKeyPair,
  password: string,
  options: AesCrypto.AesEncryptionOptions,
): EthereumKeyPair {
  // encrypt if not already encrypted
  let privateKeyEncrypted = keys?.privateKeyEncrypted
  if (!privateKeyEncrypted && password) {
    privateKeyEncrypted = encryptWithPassword(keys?.privateKey, password, options)
  }
  const encryptedKeys: EthereumKeyPair = {
    privateKey: keys?.privateKey,
    publicKey: keys?.publicKey,
    privateKeyEncrypted,
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

/** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
export function verifySignedWithPublicKey(
  data: string | Buffer,
  publicKey: EthereumPublicKey,
  signature: EthereumSignature,
): boolean {
  const signedWithPubKey = getEthereumPublicKeyFromSignature(toEthereumSignatureNative(signature), data, null)
  return ensureHexPrefixForPublicKey(signedWithPubKey) === ensureHexPrefixForPublicKey(publicKey)
}

/** Prepares a message body (e.g. a message/string to be signed) with the appropriate chain specific prefix or suffix
 * For Eth, prepends the standard message prefix ('Ethereum Signed Message:') to the beginning of data
 * Returns a HexString of the complete message (including the additions)
 * Adding data to the message allows a wallet to sign an arbitrary string without risking signing an actual transaction */
export function prepareMessageToSign(data: string | Buffer): string {
  const body = convertUtf8OrHexStringToBuffer(data)
  const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${body.length.toString()}`, 'utf-8')
  return bufferToHexString(Buffer.concat([prefix, body]))
}

/** Signs data with as a message (appending additional requried data) using private key */
export function signMessage(data: string | Buffer, privateKey: string): EthereumSignatureNative {
  const dataString = this.prepareMessageToSign(data)
  return this.sign(dataString, privateKey)
}

/** Verify that a 'personal message' was signed using the given key (signed with the private key for the provided public key)
 * A message differs than verifySignedWithPublicKey() because it might have a standard prefix appended (defined by the chain)
 * - this allows a wallet to sign an arbitrary string without risking signing an unintended transaction */
export function verifySignedMessage(
  data: string | Buffer,
  publicKey: EthereumPublicKey,
  signature: EthereumSignature,
): boolean {
  const completeMessage = this.prepareMessageToSign(data)
  return verifySignedWithPublicKey(completeMessage, publicKey, signature)
}
