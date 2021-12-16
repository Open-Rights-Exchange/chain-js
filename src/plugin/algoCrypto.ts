/* eslint-disable new-cap */
import * as algosdk from 'algosdk'
// import * as AsymmetricHelpers from '../../crypto/asymmetricHelpers'
// import { Asymmetric, Ed25519Crypto } from '../../crypto'
// import { byteArrayToHexString, hexStringToByteArray } from '../../helpers'
import {
  Helpers,
  Crypto,
  CryptoAsymmetricHelpers,
  CryptoHelpers,
  CryptoAsymmetricModels,
} from '@open-rights-exchange/chainjs'
import {
  AlgoEncryptionOptions,
  AlgorandGeneratedAccountStruct,
  AlgorandKeyPair,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandSignature,
} from './models'
// import * as ed25519Crypto from '../../crypto/ed25519Crypto'
import { toAlgorandPrivateKey, toAlgorandPublicKey, toAlgorandSignatureFromRawSig } from './helpers'
// import { ensureEncryptedValueIsObject } from '../../crypto/genericCryptoHelpers'
// import { AsymmetricScheme } from '../../crypto/asymmetricModels'

/** Verifies that the value is a valid encrypted string */
export function isSymEncryptedDataString(value: string): value is Crypto.Ed25519Crypto.Ed25519EncryptedDataString {
  return Crypto.Ed25519Crypto.isEd25519EncryptedDataString(value)
}

/** Ensures that the value confirms to a well-formed and encrypted string */
export function toSymEncryptedDataString(value: any): Crypto.Ed25519Crypto.Ed25519EncryptedDataString {
  return Crypto.Ed25519Crypto.toEd25519EncryptedDataString(value)
}

/** Encrypts a string using a password and a nonce
 *  Nacl requires password to be in a 32 byte array format. Hence we derive a key from the password string using the provided salt
 */
export function encryptWithPassword(
  unencrypted: string,
  password: string,
  options: AlgoEncryptionOptions,
): Crypto.Ed25519Crypto.Ed25519EncryptedDataString {
  const passwordKey = Crypto.Ed25519Crypto.calculatePasswordByteArray(password, options)
  const encrypted = Crypto.Ed25519Crypto.encrypt(unencrypted, passwordKey)
  return toSymEncryptedDataString(encrypted)
}

/** Decrypts the encrypted value using nacl
 * Nacl requires password to be in a 32 byte array format
 */
export function decryptWithPassword(
  encrypted: Crypto.Ed25519Crypto.Ed25519EncryptedDataString | any,
  password: string,
  options: AlgoEncryptionOptions,
): string {
  const passwordKey = Crypto.Ed25519Crypto.calculatePasswordByteArray(password, options)
  const decrypted = Crypto.Ed25519Crypto.decrypt(encrypted, passwordKey)
  return decrypted
}

/** Encrypts a string using a public key into a stringified JSON object
 * The encrypted result can be decrypted with the matching private key */
export async function encryptWithPublicKey(
  unencrypted: string,
  publicKey: AlgorandPublicKey,
  options: Crypto.Asymmetric.EciesOptions,
): Promise<Crypto.Asymmetric.AsymmetricEncryptedDataString> {
  const useOptions = {
    ...options,
    curveType: Crypto.Asymmetric.EciesCurveType.Ed25519,
    scheme: CryptoAsymmetricModels.AsymmetricScheme.ALGORAND_ASYMMETRIC_SCHEME_NAME,
  }
  const response = Crypto.Asymmetric.encryptWithPublicKey(publicKey, unencrypted, useOptions)
  return Crypto.Asymmetric.toAsymEncryptedDataString(JSON.stringify(response))
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: Crypto.Asymmetric.AsymmetricEncryptedDataString | Crypto.Asymmetric.AsymmetricEncryptedData,
  privateKey: AlgorandPrivateKey,
  options: Crypto.Asymmetric.EciesOptions,
): Promise<string> {
  const useOptions = {
    ...options,
    curveType: Crypto.Asymmetric.EciesCurveType.Ed25519,
  }
  // nacl.sign compatible secretKey (how we generateAccount) returns secretkey as:
  // --> nacl.box compatible secretKey (how we do publickeyEncryption) + publickey
  // so we separate it and take the first half as our secretKey for encryption
  const privateKeyFragment = privateKey.slice(0, privateKey.length / 2)
  const encryptedObject = CryptoHelpers.ensureEncryptedValueIsObject(
    encrypted,
  ) as Crypto.Asymmetric.AsymmetricEncryptedData
  return Crypto.Asymmetric.decryptWithPrivateKey(encryptedObject, privateKeyFragment, useOptions)
}

/** Encrypts a string using multiple assymmetric encryptions with multiple public keys - one after the other
 *  calls a helper function to perform the iterative wrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to encryptWithPublicKey
 *  The result is stringified JSON object including an array of encryption results with the last one including the final cipertext
 *  Encrypts using publicKeys in the order they appear in the array */
export async function encryptWithPublicKeys(
  unencrypted: string,
  publicKeys: AlgorandPublicKey[],
  options?: Crypto.Asymmetric.EciesOptions,
): Promise<Crypto.Asymmetric.AsymmetricEncryptedDataString> {
  return Crypto.Asymmetric.toAsymEncryptedDataString(
    await CryptoAsymmetricHelpers.encryptWithPublicKeys(encryptWithPublicKey, unencrypted, publicKeys, options),
  )
}

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
 *  calls a helper function to perform the iterative unwrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to decryptWithPrivateKey
 *  Decrypts using privateKeys that match the publicKeys provided in encryptWithPublicKeys() - provide the privateKeys in same order
 *  The result is the decrypted string */
export async function decryptWithPrivateKeys(
  encrypted: Crypto.Asymmetric.AsymmetricEncryptedDataString,
  privateKeys: AlgorandPrivateKey[],
  options?: any,
): Promise<string> {
  return CryptoAsymmetricHelpers.decryptWithPrivateKeys(decryptWithPrivateKey, encrypted, privateKeys, options)
}

/** Signs a string with a private key
 *  Returns signature as a Buffer from a UInt8Array */
export function sign(data: string, privateKey: AlgorandPrivateKey | string): AlgorandSignature {
  const signature = Crypto.Ed25519Crypto.sign(
    Helpers.hexStringToByteArray(data),
    Helpers.hexStringToByteArray(privateKey),
  )
  return toAlgorandSignatureFromRawSig(signature)
}

/** Adds privateKeyEncrypted if missing by encrypting privateKey (using password) */
function encryptAccountPrivateKeysIfNeeded(keys: AlgorandKeyPair, password: string, options: AlgoEncryptionOptions) {
  // encrypt if not already encrypted
  let privateKeyEncrypted = keys?.privateKeyEncrypted
  if (!privateKeyEncrypted && password) {
    privateKeyEncrypted = encryptWithPassword(keys?.privateKey, password, options)
  }
  const encryptedKeys = {
    privateKey: keys?.privateKey,
    publicKey: keys?.publicKey,
    privateKeyEncrypted,
  }

  return encryptedKeys as AlgorandKeyPair
}

/** Gets the algorand keypair (public and private keys) for the account */
export function getAlgorandKeyPairFromAccount(account: AlgorandGeneratedAccountStruct): AlgorandKeyPair {
  const { sk: privateKey } = account
  const { publicKey, secretKey } = Crypto.Ed25519Crypto.getKeyPairFromPrivateKey(privateKey)
  return {
    publicKey: toAlgorandPublicKey(Helpers.byteArrayToHexString(publicKey)),
    privateKey: toAlgorandPrivateKey(Helpers.byteArrayToHexString(secretKey)),
  }
}

/** Generates and returns a new public/private key pair */
export async function generateKeyPair(): Promise<AlgorandKeyPair> {
  const newAccount = algosdk.generateAccount()
  const keys = getAlgorandKeyPairFromAccount(newAccount)
  return keys
}

/** Gets the algorand keypair (public and private keys) for the privateKey */
export function getAlgorandKeyPairFromPrivateKey(privateKey: AlgorandPrivateKey): AlgorandKeyPair {
  const { publicKey, secretKey } = Crypto.Ed25519Crypto.getKeyPairFromPrivateKey(
    Helpers.hexStringToByteArray(privateKey),
  )
  return {
    publicKey: toAlgorandPublicKey(Helpers.byteArrayToHexString(publicKey)),
    privateKey: toAlgorandPrivateKey(Helpers.byteArrayToHexString(secretKey)),
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
export async function generateNewAccountKeysAndEncryptPrivateKeys(password: string, options: AlgoEncryptionOptions) {
  const keys = await generateKeyPair()
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password, options)
  return encryptedKeys
}

/** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
export function verifySignedWithPublicKey(
  data: string,
  publicKey: AlgorandPublicKey,
  signature: AlgorandSignature,
): boolean {
  return Crypto.Ed25519Crypto.verify(
    Helpers.hexStringToByteArray(data),
    Helpers.hexStringToByteArray(publicKey),
    Helpers.hexStringToByteArray(signature),
  )
}

/** Signs data as a message using private key (Algorand does not append additional fields for a message) */
export function signMessage(data: string, privateKey: AlgorandPrivateKey | string): AlgorandSignature {
  return sign(data, privateKey)
}

/** Verify that a 'personal message' was signed using the given key (Algorand does not append additional fields for a message) */
export function verifySignedMessage(data: string, publicKey: AlgorandPublicKey, signature: AlgorandSignature): boolean {
  return verifySignedWithPublicKey(data, publicKey, signature)
}
