import * as algosdk from 'algosdk'
import * as nacl from 'tweetnacl'
import * as base32 from 'hi-base32'
import { encodeBase64, encodeUTF8, decodeBase64, decodeUTF8 } from 'tweetnacl-util'
import { isAString } from '../../helpers'
import { EncryptedDataString } from '../../models'
import {
  AlgorandPublicKey,
  AlgorandPrivateKey,
  AlgorandSignature,
  AlgorandKeyPair,
  AlgorandAddress,
} from './models/cryptoModels'
import * as ed25519Crypto from '../../crypto/ed25519Crypto'
import { ALGORAND_CHECKSUM_BYTE_LENGTH, ALGORAND_ADDRESS_LENGTH, ALGORAND_ADDRESS_BYTE_LENGTH } from './algoConstants'
import { concatArrays, genericHash } from './helpers/cryptoModelHelpers'
import { AlgorandMultiSigOptions, AlgorandMutliSigAccount } from './models/generalModels'
import { AlgorandGenerateAccountResponse } from './models/accountModels'

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
 * The encrypted value is a base64 encoded decrypted string */
export function decrypt(encrypted: EncryptedDataString | any, password: string): string {
  const decrypted = ed25519Crypto.decrypt(encrypted, password)
  const base64DecryptedMessage = encodeBase64(decrypted)
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

/** Gets the algorand public key from the given private key in the account
 * Returns base64 encoded public key and private key
 */
export function getAlgorandKeyPairFromAccount(account: AlgorandGenerateAccountResponse): AlgorandKeyPair {
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
export function generateNewAccountKeysAndEncryptPrivateKeys(password: string) {
  const newAccount = algosdk.generateAccount()
  const keys = getAlgorandKeyPairFromAccount(newAccount)
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password)
  return encryptedKeys
}

/** Computes algorand address from the algorand public key */
export function getAddressFromPublicKey(publicKey: AlgorandPublicKey): AlgorandAddress {
  const decodedPublicKey = decodeBase64(publicKey)
  // compute checksum
  const checksum = genericHash(decodedPublicKey).slice(
    nacl.sign.publicKeyLength - ALGORAND_CHECKSUM_BYTE_LENGTH,
    nacl.sign.publicKeyLength,
  )
  const address = base32.encode(concatArrays(decodedPublicKey, checksum))
  return address.toString().slice(0, ALGORAND_ADDRESS_LENGTH) // removing the extra '===='
}

/** Computes algorand public key from the algorand address */
export function getAlgorandPublicKeyFromAddress(address: AlgorandAddress): AlgorandPublicKey {
  const ADDRESS_MALFORMED_ERROR = 'address seems to be malformed'
  if (!isAString(address)) throw new Error(ADDRESS_MALFORMED_ERROR)

  // try to decode
  const decoded = base32.decode.asBytes(address)

  // Sanity check
  if (decoded.length !== ALGORAND_ADDRESS_BYTE_LENGTH) throw new Error(ADDRESS_MALFORMED_ERROR)

  const publicKey = new Uint8Array(decoded.slice(0, ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH))
  return encodeBase64(publicKey) as AlgorandPublicKey
}

/** Generates a new multisig address using the multisig options including version, threshhold and addresses */
export function generateMultiSigAccount(multiSigOptions: AlgorandMultiSigOptions) {
  const mSigOptions = {
    version: multiSigOptions.version,
    threshold: multiSigOptions.threshold,
    addrs: multiSigOptions.accounts,
  }
  const multisigAddress: AlgorandMutliSigAccount = algosdk.multisigAddress(mSigOptions)
  const publicKey = getAlgorandPublicKeyFromAddress(multisigAddress)
  return { publicKey }
}
