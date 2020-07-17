import scrypt from 'scrypt-async'
import * as base32 from 'hi-base32'
import * as nacl from 'tweetnacl'
import * as sha512 from 'js-sha512'
import * as algosdk from 'algosdk'
import * as ed25519Crypto from '../../../crypto/ed25519Crypto'
import { hexStringToByteArray, isNullOrEmpty, byteArrayToHexString, isAString } from '../../../helpers'
import {
  ALGORAND_PASSWORD_ENCRYPTION_CONSTANTS,
  ALGORAND_ADDRESS_BYTE_LENGTH,
  ALGORAND_CHECKSUM_BYTE_LENGTH,
  ALGORAND_ADDRESS_LENGTH,
} from '../algoConstants'
import {
  AlgorandPublicKey,
  AlgorandSignature,
  AlgorandPrivateKey,
  AlgorandMultiSigAccount,
  AlgorandMultiSigOptions,
  AlgorandAddress,
} from '../models'

/** Converts a password string using salt to a key(32 byte array)
 * The scrypt password-base key derivation function (pbkdf) is an algorithm converts human readable passwords into fixed length arrays of bytes.
 * It can then be used as a key for symmetric block ciphers and private keys
 */
export function calculatePasswordByteArray(password: string, salt: string = ''): Uint8Array {
  let passwordArray
  scrypt(password, salt, ALGORAND_PASSWORD_ENCRYPTION_CONSTANTS, (derivedKey: any) => {
    passwordArray = derivedKey
  })
  return passwordArray
}

/**
 * ConcatArrays takes two array and returns a joint Uint8 array of both
 */
export function concatArrays(a: any, b: any): Uint8Array {
  const c = new Uint8Array(a.length + b.length)
  c.set(a)
  c.set(b, a.length)
  return c
}

/** Return sha512 hash of an array */
export function genericHash(arr: Uint8Array) {
  return sha512.sha512_256.array(arr)
}

export function isValidAlgorandPublicKey(value: string | AlgorandPublicKey): value is AlgorandPublicKey {
  if (!value) return false
  return ed25519Crypto.isValidPublicKey(hexStringToByteArray(value))
}

export function isValidAlgorandPrivateKey(value: string): value is AlgorandPrivateKey {
  return ed25519Crypto.isValidPrivateKey(hexStringToByteArray(value))
}

// ALGO TODO: add validation rule for signature
export function isValidAlgorandSignature(signature: string): boolean {
  if (!isNullOrEmpty(signature)) {
    return true
  }
  return false
}

/** Accepts hex string checks if a valid algorand private key
 *  Returns AlgorandPrivatekey
 */
export function toAlgorandPrivateKey(value: string): AlgorandPrivateKey {
  if (isValidAlgorandPrivateKey(value)) {
    return value as AlgorandPrivateKey
  }
  throw new Error(`Not a valid algorand private key:${value}.`)
}

/** Accepts hex string checks if a valid algorand public key
 *  Returns AlgorandPublicKey
 */
export function toAlgorandPublicKey(value: string): AlgorandPublicKey {
  if (isValidAlgorandPublicKey(value)) {
    return value as AlgorandPublicKey
  }
  throw new Error(`Not a valid algorand public key:${value}.`)
}

export function toAlgorandSignature(value: string): AlgorandSignature {
  if (isValidAlgorandSignature(value)) {
    return value as AlgorandSignature
  }
  throw new Error(`Not a valid algorand signature:${value}.`)
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
export function determineMultiSigAddress(multiSigOptions: AlgorandMultiSigOptions) {
  const mSigOptions = {
    version: multiSigOptions.version,
    threshold: multiSigOptions.threshold,
    addrs: multiSigOptions.addrs,
  }
  const multisigAddress: AlgorandMultiSigAccount = algosdk.multisigAddress(mSigOptions)
  return multisigAddress
}
