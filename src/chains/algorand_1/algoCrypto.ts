/* eslint-disable new-cap */
import * as algosdk from 'algosdk'
import * as Asymmetric from '../../crypto/asymmetric'
import { byteArrayToHexString, hexStringToByteArray } from '../../helpers'
import { EncryptedDataString } from '../../models'
import {
  AlgoEncryptionOptions,
  AlgorandGeneratedAccountStruct,
  AlgorandKeyPair,
  AlgorandNewKeysOptions,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandSignature,
} from './models'
import * as ed25519Crypto from '../../crypto/ed25519Crypto'
import { toAlgorandPrivateKey, toAlgorandPublicKey, toAlgorandSignatureFromRawSig } from './helpers'
import { ensureEncryptedValueIsObject } from '../../crypto/cryptoHelpers'

const ALGORAND_ASYMMETRIC_SCHEME_NAME = 'chainjs.algorand.ed25519'

/** Verifies that the value is a valid encrypted string */
export function isEncryptedDataString(value: string): value is EncryptedDataString {
  return ed25519Crypto.isEncryptedDataString(value)
}

/** Ensures that the value confirms to a well-formed and encrypted string */
export function toEncryptedDataString(value: any): EncryptedDataString {
  return ed25519Crypto.toEncryptedDataString(value)
}

/** Encrypts a string using a password and a nonce
 *  Nacl requires password to be in a 32 byte array format. Hence we derive a key from the password string using the provided salt
 */
export function encryptWithPassword(
  unencrypted: string,
  password: string,
  options: AlgoEncryptionOptions,
): EncryptedDataString {
  const passwordKey = ed25519Crypto.calculatePasswordByteArray(password, options)
  const encrypted = ed25519Crypto.encrypt(unencrypted, passwordKey)
  return toEncryptedDataString(encrypted)
}

/** Decrypts the encrypted value using nacl
 * Nacl requires password to be in a 32 byte array format
 */
export function decryptWithPassword(
  encrypted: EncryptedDataString | any,
  password: string,
  options: AlgoEncryptionOptions,
): string {
  const passwordKey = ed25519Crypto.calculatePasswordByteArray(password, options)
  const decrypted = ed25519Crypto.decrypt(encrypted, passwordKey)
  return decrypted
}

/** Encrypts a string using a public key into a stringified JSON object
 * The encrypted result can be decrypted with the matching private key */
export async function encryptWithPublicKey(
  unencrypted: string,
  publicKey: AlgorandPublicKey,
  options: Asymmetric.Options,
): Promise<string> {
  const useOptions = { ...options, curveType: Asymmetric.CurveType.Ed25519 }
  const publicKeyBuffer = Buffer.from(publicKey, 'hex')
  const response = Asymmetric.encryptWithPublicKey(publicKeyBuffer, unencrypted, useOptions)
  const encryptedToReturn = { ...response, ...{ scheme: ALGORAND_ASYMMETRIC_SCHEME_NAME } }
  return JSON.stringify(encryptedToReturn)
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: string,
  privateKey: AlgorandPrivateKey,
  options: Asymmetric.Options,
): Promise<string> {
  const useOptions = { ...options, curveType: Asymmetric.CurveType.Ed25519 }
  // nacl.sign compatible secretKey (how we generateAccount) returns secretkey as:
  // --> nacl.box compatible secretKey (how we do publickeyEncryption) + publickey
  // so we separate it and take the first half as our secretKey for encryption
  const sk = privateKey.slice(0, privateKey.length / 2)
  const privateKeyByteArray = hexStringToByteArray(sk)
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  return Asymmetric.decryptWithPrivateKey(encryptedObject, privateKeyByteArray, useOptions)
}

/** Signs a string with a private key
 *  Returns signature as a Buffer from a UInt8Array */
export function sign(data: string, privateKey: AlgorandPrivateKey | string): AlgorandSignature {
  const signature = Buffer.from(ed25519Crypto.sign(hexStringToByteArray(data), hexStringToByteArray(privateKey)))
  return toAlgorandSignatureFromRawSig(signature)
}

/** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
export function verifySignedWithPublicKey(
  data: string,
  publicKey: AlgorandPublicKey,
  signature: AlgorandSignature,
): boolean {
  return ed25519Crypto.verify(
    hexStringToByteArray(data),
    hexStringToByteArray(publicKey),
    hexStringToByteArray(signature),
  )
}

/** Replaces unencrypted privateKey in keys object
 *  Encrypts key using password */
function encryptAccountPrivateKeysIfNeeded(keys: AlgorandKeyPair, password: string, options: AlgoEncryptionOptions) {
  const { privateKey, publicKey } = keys
  const encryptedKeys = {
    privateKey: encryptWithPassword(privateKey, password, options),
    publicKey,
  }
  return encryptedKeys as AlgorandKeyPair
}

/** Gets the algorand keypair (public and private keys) for the account */
export function getAlgorandKeyPairFromAccount(account: AlgorandGeneratedAccountStruct): AlgorandKeyPair {
  const { sk: privateKey } = account
  const { publicKey, secretKey } = ed25519Crypto.getKeyPairFromPrivateKey(privateKey)
  return {
    publicKey: toAlgorandPublicKey(byteArrayToHexString(publicKey)),
    privateKey: toAlgorandPrivateKey(byteArrayToHexString(secretKey)),
  }
}

/** Gets the algorand keypair (public and private keys) for the privateKey */
export function getAlgorandKeyPairFromPrivateKey(privateKey: AlgorandPrivateKey): AlgorandKeyPair {
  const { publicKey, secretKey } = ed25519Crypto.getKeyPairFromPrivateKey(hexStringToByteArray(privateKey))
  return {
    publicKey: toAlgorandPublicKey(byteArrayToHexString(publicKey)),
    privateKey: toAlgorandPrivateKey(byteArrayToHexString(secretKey)),
  }
}

/** Gets the algorand keypair (public and private keys) for the privateKey */
export function getAlgorandPublicKeyFromPrivateKey(privateKey: AlgorandPrivateKey): AlgorandPublicKey {
  const { publicKey } = getAlgorandKeyPairFromPrivateKey(privateKey)
  return publicKey
}

/** Generates new public and private key pair
 * Encrypts the private key using password
 */
export function generateNewAccountKeysAndEncryptPrivateKeys(password: string, options: AlgorandNewKeysOptions) {
  const newAccount = algosdk.generateAccount()
  const keys = getAlgorandKeyPairFromAccount(newAccount)
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password, { salt: options?.salt })
  return encryptedKeys
}
