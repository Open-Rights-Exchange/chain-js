/* eslint-disable new-cap */
import * as eosEcc from 'eosjs-ecc'
import base58 from 'bs58'
import * as Asymmetric from '../../crypto/asymmetric'
import { AesCrypto, CryptoHelpers } from '../../crypto'
import { TRANSACTION_ENCODING } from './eosConstants'
import { EosAccountKeys, EosSignature, EosPublicKey, EosPrivateKey } from './models'
import { KeyPair, KeyPairEncrypted, Signature, EncryptedDataString } from '../../models'
import { throwNewError } from '../../errors'
import { isNullOrEmpty, removeEmptyValuesInJsonObject } from '../../helpers'
import { toEosPublicKey } from './helpers'
import { ensureEncryptedValueIsObject } from '../../crypto/cryptoHelpers'

const { Keygen } = require('eosjs-keygen')

const EOS_ASYMMETRIC_SCHEME_NAME = 'chainjs.eos.secp256k1'

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
  publicKey: EosPublicKey,
  options: Asymmetric.Options,
): Promise<string> {
  const useOptions = { ...options, curveType: Asymmetric.CurveType.Secp256k1 }
  const publicKeyBuffer = eosEcc
    .PublicKey(publicKey)
    .toUncompressed()
    .toBuffer()
  const response = Asymmetric.encryptWithPublicKey(publicKeyBuffer, unencrypted, useOptions)
  const encryptedToReturn = { ...response, ...{ scheme: EOS_ASYMMETRIC_SCHEME_NAME } }
  return JSON.stringify(encryptedToReturn)
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: string,
  privateKey: string,
  options?: Asymmetric.Options,
): Promise<string> {
  const useOptions = { ...options, curveType: Asymmetric.CurveType.Secp256k1 }
  const privateKeyBuffer = eosEcc.PrivateKey(privateKey).toBuffer()
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  return Asymmetric.decryptWithPrivateKey(encryptedObject, privateKeyBuffer, useOptions)
}

/** Signs data with private key */
export function sign(
  data: string | Buffer,
  privateKey: EosPrivateKey | string,
  encoding: string = TRANSACTION_ENCODING,
): EosSignature {
  return eosEcc.sign(data, privateKey, encoding)
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
  publicKey: EosSignature | Buffer,
  data: string | Buffer,
  encoding: string = TRANSACTION_ENCODING,
): boolean {
  return eosEcc.verify(data, publicKey, encoding)
}

export async function generateRawKeyPair(): Promise<KeyPair> {
  const privateKey = await eosEcc.randomKey()
  const publicKey = eosEcc.privateToPublic(privateKey) // EOSkey...
  return { private: privateKey, public: publicKey }
}

/** Replaces unencrypted privateKeys (owner and active) in keys object
 *  Encrypts keys using password and optional salt */
function encryptAccountPrivateKeysIfNeeded(
  keys: any,
  password: string,
  encryptionOptions: AesCrypto.AesEncryptionOptions,
) {
  const { privateKeys, publicKeys } = keys
  const encryptedKeys = {
    privateKeys: {
      owner: isEncryptedDataString(privateKeys.owner)
        ? privateKeys.owner
        : encryptWithPassword(privateKeys.owner, password, encryptionOptions).toString(),
      active: isEncryptedDataString(privateKeys.active)
        ? privateKeys.active
        : encryptWithPassword(privateKeys.active, password, encryptionOptions).toString(),
    },
    publicKeys: { ...publicKeys },
  }
  return encryptedKeys
}

/** Generates new owner and active key pairs (public and private)
 *  Encrypts private keys with provided password and optional salt
 *  Returns: { publicKeys:{owner, active}, privateKeys:{owner, active} } */
export async function generateNewAccountKeysAndEncryptPrivateKeys(
  password: string,
  overrideKeys: any = {},
  encryptionOptions: AesCrypto.AesEncryptionOptions,
) {
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
): Promise<KeyPairEncrypted> {
  if (isNullOrEmpty(password)) throwNewError('generateKeyPairAndEncryptPrivateKeys: Must provide password for new keys')
  const keys = await generateRawKeyPair()
  return {
    public: toEosPublicKey(keys.public),
    privateEncrypted: toEncryptedDataString(encryptWithPassword(keys.private, password, encryptionOptions)),
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
