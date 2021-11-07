/* eslint-disable new-cap */
import * as eosEcc from 'eosjs-ecc'
import base58 from 'bs58'
import { AesCrypto, Asymmetric } from '../../crypto'
import { TRANSACTION_ENCODING } from './eosConstants'
import { EosAccountKeys, EosSignature, EosPublicKey, EosPrivateKey, EosKeyPair } from './models'
import { Signature } from '../../models'
import { isHexString, removeEmptyValuesInJsonObject } from '../../helpers'
import { toEosPublicKey } from './helpers'
import { ensureEncryptedValueIsObject } from '../../crypto/genericCryptoHelpers'
import * as AsymmetricHelpers from '../../crypto/asymmetricHelpers'
import { AsymmetricScheme } from '../../crypto/asymmetricModels'

const { Keygen } = require('eosjs-keygen')

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
  publicKey: EosPublicKey,
  options: Asymmetric.EciesOptions,
): Promise<Asymmetric.AsymmetricEncryptedDataString> {
  const useOptions = {
    ...options,
    curveType: Asymmetric.EciesCurveType.Secp256k1,
    scheme: AsymmetricScheme.EOS_ASYMMETRIC_SCHEME_NAME,
  }
  const publicKeyUncompressed = eosEcc.PublicKey(publicKey).toUncompressed().toBuffer().toString('hex')
  const response = Asymmetric.encryptWithPublicKey(publicKeyUncompressed, unencrypted, useOptions)
  return Asymmetric.toAsymEncryptedDataString(JSON.stringify(response))
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: Asymmetric.AsymmetricEncryptedDataString | Asymmetric.AsymmetricEncryptedData,
  privateKey: EosPrivateKey,
  options?: Asymmetric.EciesOptions,
): Promise<string> {
  const useOptions = { ...options, curveType: Asymmetric.EciesCurveType.Secp256k1 }
  const privateKeyHex = eosEcc.PrivateKey(privateKey).toBuffer().toString('hex')
  const encryptedObject = ensureEncryptedValueIsObject(encrypted) as Asymmetric.AsymmetricEncryptedData
  return Asymmetric.decryptWithPrivateKey(encryptedObject, privateKeyHex, useOptions)
}

/** Encrypts a string using multiple assymmetric encryptions with multiple public keys - one after the other
 *  calls a helper function to perform the iterative wrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to encryptWithPublicKey
 *  The result is stringified JSON object including an array of encryption results with the last one including the final cipertext
 *  Encrypts using publicKeys in the order they appear in the array */
export async function encryptWithPublicKeys(
  unencrypted: string,
  publicKeys: EosPublicKey[],
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
  privateKeys: EosPublicKey[],
  options?: any,
): Promise<string> {
  return AsymmetricHelpers.decryptWithPrivateKeys(decryptWithPrivateKey, encrypted, privateKeys, options)
}

/** Signs data with private key */
export function sign(data: string | Buffer, privateKey: EosPrivateKey | string): EosSignature {
  const encoding = isHexString(data) ? 'hex' : 'utf8'
  return eosEcc.sign(data, privateKey, encoding)
}

/** Generates and returns a new public/private key pair */
export async function generateKeyPair(): Promise<EosKeyPair> {
  const privateKey = await eosEcc.randomKey()
  const publicKey = eosEcc.privateToPublic(privateKey) // EOSkey...
  return { privateKey, publicKey }
}

/** Returns public key from signature */
export function getPublicKeyFromSignature(
  signature: Signature | EosSignature | string | Buffer,
  data: string | Buffer,
  encoding: string = TRANSACTION_ENCODING,
): EosPublicKey {
  return eosEcc.recover(signature, data, encoding)
}

/** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
export function verifySignedWithPublicKey(
  data: string | Buffer,
  publicKey: EosPublicKey,
  signature: EosSignature,
): boolean {
  const encoding = isHexString(data) ? 'hex' : 'utf8'
  return eosEcc.verify(signature, data, publicKey, encoding)
}

/** Adds privateKeyEncrypted (owner and/or active) if missing by encrypting privateKey (using password) */
function encryptAccountPrivateKeysIfNeeded(
  keys: EosAccountKeys,
  password: string,
  encryptionOptions: AesCrypto.AesEncryptionOptions,
): EosAccountKeys {
  const { privateKeys, publicKeys } = keys
  const encryptedKeys: EosAccountKeys = {
    privateKeysEncrypted: {
      owner: keys?.privateKeysEncrypted?.owner,
      active: keys?.privateKeysEncrypted?.active,
    },
    privateKeys: { ...privateKeys },
    publicKeys: { ...publicKeys },
  }
  // encrypt keys if not already encrypted (and password provided)
  if (!encryptedKeys.privateKeysEncrypted.owner && password) {
    encryptedKeys.privateKeysEncrypted.owner = encryptWithPassword(privateKeys.owner, password, encryptionOptions)
  }
  if (!encryptedKeys.privateKeysEncrypted.active && password) {
    encryptedKeys.privateKeysEncrypted.active = encryptWithPassword(privateKeys.active, password, encryptionOptions)
  }

  return encryptedKeys
}

/** Generates new owner and active key pairs (public and private)
 *  Encrypts private keys with provided password and optional salt
 *  Returns: { publicKeys:{owner, active}, privateKeys:{owner, active}, privateKeysEncrypted:{owner, active} } */
export async function generateNewAccountKeysAndEncryptPrivateKeys(
  password: string,
  overrideKeys: any = {},
  encryptionOptions: AesCrypto.AesEncryptionOptions,
): Promise<EosAccountKeys> {
  // remove any empty values passed-in (e.g. active=undefined or '' )
  removeEmptyValuesInJsonObject(overrideKeys)

  // Formally named generateEncryptedKeys
  const keys: EosAccountKeys = await Keygen.generateMasterKeys()
  const replacedKeys = {
    publicKeys: {
      ...keys.publicKeys,
      ...overrideKeys.publicKeys,
    },
    privateKeys: {
      ...keys.privateKeys,
      ...overrideKeys.privateKeys,
    },
  }
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(replacedKeys, password, encryptionOptions)
  return encryptedKeys
}

/** Generate a random private/public key pair and encrypt using provided password and optional salt */
export async function generateKeyPairAndEncryptPrivateKeys(
  password: string,
  encryptionOptions: AesCrypto.AesEncryptionOptions,
): Promise<EosKeyPair> {
  const keys = await generateKeyPair()
  return {
    publicKey: toEosPublicKey(keys.publicKey),
    privateKey: keys.privateKey,
    privateKeyEncrypted: password ? encryptWithPassword(keys.privateKey, password, encryptionOptions) : null,
  }
}

// Remove the EOS or PUB_K1_ prefix from an EOS Public Key
export function removeEosPublicKeyPrefix(publickey: EosPublicKey) {
  let pubKeyOut: string = publickey
  const match = publickey.match(/^PUB_([A-Za-z0-9]+)_([A-Za-z0-9]+)$/)
  if (match === null) {
    // legacy
    if (/^EOS/.test(publickey)) {
      pubKeyOut = publickey.substring(3) // remove 'EOS' prefix
    } else {
      pubKeyOut = pubKeyOut.substring(7) // remove 'PUB_K1_' prefix
    }
  }
  return pubKeyOut
}

// See last answer: https://eosio.stackexchange.com/questions/36/what-are-the-formats-for-the-pub-key-priv-key-signatures

/** Convert an EOS public key format to a 'raw' ECC public key usable with ECC libraries */
export function eosPublicKeyToEccPublicKey(eosPublicKey: EosPublicKey) {
  const eosPublicKeyObject = eosEcc.PublicKey.fromStringOrThrow(eosPublicKey)
  const uncompressed = eosPublicKeyObject.toUncompressed()
  const eosPublicHexRaw = base58
    .decode(removeEosPublicKeyPrefix(uncompressed.toString('hex')))
    .slice(0, 64) // trim first byte (x80 prefix) and last 4 bytes (checksum)
    .toString('hex')
  return eosPublicHexRaw
}

/** Convert an EOS private key format to a 'raw' ECC private key usable with ECC libraries */
export function eosPrivateKeyToEccPrivateKey(eosPrivateKey: EosPrivateKey) {
  // const eosPrivate = eosEcc.PrivateKey.fromString(eosPrivateKey)
  const eosPrivHexRaw = base58
    .decode(eosPrivateKey)
    .slice(0, 33) // trim first byte (x80 prefix) and last 4 bytes (checksum)
    .toString('hex')
  return eosPrivHexRaw
}

/** Signs data as a message using private key (Eos does not append additional fields for a message) */
export function signMessage(data: string, privateKey: EosPrivateKey | string): EosSignature {
  return sign(data, privateKey)
}

/** Verify that a 'personal message' was signed using the given key (Eos does not append additional fields for a message) */
export function verifySignedMessage(data: string, publicKey: EosPublicKey, signature: EosSignature): boolean {
  return verifySignedWithPublicKey(data, publicKey, signature)
}

export function getPublicKeyFromPrivateKey(privateKey: EosPrivateKey) {
  return eosEcc.privateToPublic(privateKey)
}
