import * as algosdk from 'algosdk'
import { encodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util'
import { EncryptedDataString } from '../../models'
import { AlgorandPublicKey, AlgorandPrivateKey, AlgorandSignature, AlgorandKeyPair } from './models/cryptoModels'
import * as ed25519Crypto from '../../crypto/ed25519Crypto'
import { AlgorandAccountStruct } from './models/algoStructures'

/** Converts a string to uint8 array */
function toUnit8Array(encodedString: string) {
  return decodeUTF8(encodedString)
}

function toStringFromUnit8Array(array: Uint8Array) {
  return encodeUTF8(array)
}

/** Verifies that the value is a valid encrypted string */
export function isEncryptedDataString(value: string): value is EncryptedDataString {
  return ed25519Crypto.isEncryptedDataString(value)
}

/** Ensures that the value confirms to a well-formed and encrypted string */
export function toEncryptedDataString(value: any): EncryptedDataString {
  return ed25519Crypto.toEncryptedDataString(value)
}

/** Encrypts a string using a password and a nonce */
export function encrypt(unencrypted: string, password: string): EncryptedDataString {
  const encrypted = ed25519Crypto.encrypt(unencrypted, password)
  const base64EncryptedMessage = encodeBase64(encrypted)
  return base64EncryptedMessage as EncryptedDataString
}

/** Decrypts the encrypted value using a password, ausing nacl
 * The encrypted value is either a stringified JSON object */
export function decrypt(encrypted: EncryptedDataString | any, password: string): string {
  const decrypted = ed25519Crypto.decrypt(encrypted, password)
  const base64DecryptedMessage = encodeUTF8(decrypted)
  return base64DecryptedMessage
}

/** Signs a string with a private key */
export function sign(data: string, privateKey: AlgorandPrivateKey | string): AlgorandSignature {
  const signature = ed25519Crypto.sign(toUnit8Array(data), toUnit8Array(privateKey))
  return toStringFromUnit8Array(signature) as AlgorandSignature
}

/** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
export function verifySignedWithPublicKey(
  data: string,
  publicKey: AlgorandPublicKey,
  signature: AlgorandSignature,
): boolean {
  return ed25519Crypto.verify(toUnit8Array(data), toUnit8Array(publicKey), toUnit8Array(signature))
}

/** Replaces unencrypted privateKey in keys object
 *  Encrypts key using password */
function encryptAccountPrivateKeysIfNeeded(keys: AlgorandKeyPair, password: string) {
  const { privateKey, publicKey } = keys
  const encryptedKeys = {
    privateKey: ed25519Crypto.isEncryptedDataString(privateKey)
      ? privateKey
      : encodeBase64(ed25519Crypto.encrypt(privateKey, password)),
    publicKey,
  }
  return encryptedKeys as AlgorandKeyPair
}

/** Gets the algorand public key from the given private key in the account */
export function getAlgorandKeyPairFromAccount(account: AlgorandAccountStruct): AlgorandKeyPair {
  const { sk: privateKey } = account
  const { publicKey, secretKey } = ed25519Crypto.getKeyPairFromPrivateKey(privateKey)
  return {
    publicKey: encodeBase64(publicKey) as AlgorandPublicKey,
    privateKey: encodeBase64(secretKey) as AlgorandPrivateKey,
  }
}

/** Generates new public and private key pair
 * Encrypts the private key using password
 */
export function generateNewAccountKeysAndEncryptPrivateKeys(password: string): any {
  const newAccount = algosdk.generateAccount()
  const keys = getAlgorandKeyPairFromAccount(newAccount)
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password)
  return encryptedKeys
}
