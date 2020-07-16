import * as algosdk from 'algosdk'
import * as base32 from 'hi-base32'

import * as nacl from 'tweetnacl'
import { byteArrayToHexString, hexStringToByteArray, isAString } from '../../helpers'
import { EncryptedDataString } from '../../models'
import {
  AlgorandAddress,
  AlgorandGeneratedAccountStruct,
  AlgorandKeyPair,
  AlgorandMultiSigAccount,
  AlgorandMultiSigOptions,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandSignature,
} from './models'
import * as ed25519Crypto from '../../crypto/ed25519Crypto'
import { ALGORAND_ADDRESS_BYTE_LENGTH, ALGORAND_ADDRESS_LENGTH, ALGORAND_CHECKSUM_BYTE_LENGTH } from './algoConstants'
import {
  calculatePasswordByteArray,
  concatArrays,
  genericHash,
  toAlgorandPrivateKey,
  toAlgorandPublicKey,
  toAlgorandSignature,
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
export function encrypt(unencrypted: string, password: string, salt: string): EncryptedDataString {
  const passwordKey = calculatePasswordByteArray(password, salt)
  const encrypted = ed25519Crypto.encrypt(unencrypted, passwordKey)
  return byteArrayToHexString(encrypted) as EncryptedDataString
}

/** Decrypts the encrypted value using nacl
 * Nacl requires password to be in a 32 byte array format
 */
export function decrypt(encrypted: EncryptedDataString | any, password: string, salt: string): string {
  const passwordKey = calculatePasswordByteArray(password, salt)
  const decrypted = ed25519Crypto.decrypt(encrypted, passwordKey)
  return byteArrayToHexString(decrypted)
}

/** Signs a string with a private key */
export function sign(data: string, privateKey: AlgorandPrivateKey | string): AlgorandSignature {
  const signature = ed25519Crypto.sign(hexStringToByteArray(data), hexStringToByteArray(privateKey))
  return toAlgorandSignature(byteArrayToHexString(signature))
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
function encryptAccountPrivateKeysIfNeeded(keys: AlgorandKeyPair, password: string, salt: string) {
  const { privateKey, publicKey } = keys
  const encryptedKeys = {
    privateKey: encrypt(privateKey, password, salt),
    publicKey,
  }
  return encryptedKeys as AlgorandKeyPair
}

/** Gets the algorand public key from the given private key in the account
 * Returns hex public key and private key
 */
export function getAlgorandKeyPairFromAccount(account: AlgorandGeneratedAccountStruct): AlgorandKeyPair {
  const { sk: privateKey } = account
  const { publicKey, secretKey } = ed25519Crypto.getKeyPairFromPrivateKey(privateKey)
  return {
    publicKey: toAlgorandPublicKey(byteArrayToHexString(publicKey)),
    privateKey: toAlgorandPrivateKey(byteArrayToHexString(secretKey)),
  }
}

/** Generates new public and private key pair
 * Encrypts the private key using password
 */
export function generateNewAccountKeysAndEncryptPrivateKeys(password: string, salt: string) {
  const newAccount = algosdk.generateAccount()
  const keys = getAlgorandKeyPairFromAccount(newAccount)
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password, salt)
  return encryptedKeys
}

/** Computes algorand address from the algorand public key */
export function toAddressFromPublicKey(publicKey: AlgorandPublicKey): AlgorandAddress {
  const rawPublicKey = hexStringToByteArray(publicKey)
  // compute checksum
  const checksum = genericHash(rawPublicKey).slice(
    nacl.sign.publicKeyLength - ALGORAND_CHECKSUM_BYTE_LENGTH,
    nacl.sign.publicKeyLength,
  )
  const address = base32.encode(concatArrays(rawPublicKey, checksum))
  return address.toString().slice(0, ALGORAND_ADDRESS_LENGTH) // removing the extra '===='
}

/** Computes algorand public key from the algorand address */
export function toPublicKeyFromAddress(address: AlgorandAddress): AlgorandPublicKey {
  const ADDRESS_MALFORMED_ERROR = 'address seems to be malformed'
  if (!isAString(address)) throw new Error(ADDRESS_MALFORMED_ERROR)

  // try to decode
  const decoded = base32.decode.asBytes(address)

  // Sanity check
  if (decoded.length !== ALGORAND_ADDRESS_BYTE_LENGTH) throw new Error(ADDRESS_MALFORMED_ERROR)

  const publicKey = new Uint8Array(decoded.slice(0, ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH))
  return byteArrayToHexString(publicKey) as AlgorandPublicKey
}

/** Calculates the multisig address using the multisig options including version, threshhold and addresses */
export function toMultiSigAddress(multiSigOptions: AlgorandMultiSigOptions) {
  const mSigOptions = {
    version: multiSigOptions.version,
    threshold: multiSigOptions.threshold,
    addrs: multiSigOptions.addrs,
  }
  const multisigAddress: AlgorandMultiSigAccount = algosdk.multisigAddress(mSigOptions)
  return multisigAddress
}
