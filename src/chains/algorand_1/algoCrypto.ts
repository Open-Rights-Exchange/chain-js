import * as algosdk from 'algosdk'
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
import {
  calculatePasswordByteArray,
  toAlgorandPrivateKey,
  toAlgorandPublicKey,
  toAlgorandSignatureFromRawSig,
} from './helpers'

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
export function encrypt(unencrypted: string, password: string, options: AlgoEncryptionOptions): EncryptedDataString {
  const { salt } = options
  const passwordKey = calculatePasswordByteArray(password, salt)
  const encrypted = ed25519Crypto.encrypt(unencrypted, passwordKey)
  return byteArrayToHexString(encrypted) as EncryptedDataString
}

/** Decrypts the encrypted value using nacl
 * Nacl requires password to be in a 32 byte array format
 */
export function decrypt(
  encrypted: EncryptedDataString | any,
  password: string,
  options: AlgoEncryptionOptions,
): string {
  const { salt } = options
  const passwordKey = calculatePasswordByteArray(password, salt)
  const decrypted = ed25519Crypto.decrypt(encrypted, passwordKey)
  return byteArrayToHexString(decrypted)
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
    privateKey: encrypt(privateKey, password, options),
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
