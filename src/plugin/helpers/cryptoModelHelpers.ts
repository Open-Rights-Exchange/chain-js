import * as base32 from 'hi-base32'
import * as nacl from 'tweetnacl'
import * as sha512 from 'js-sha512'

import { Helpers, Crypto, Errors } from '@open-rights-exchange/chainjs'
import {
  ALGORAND_ADDRESS_BYTES_ONLY_LENGTH,
  ALGORAND_CHECKSUM_BYTE_LENGTH,
  ALGORAND_ADDRESS_LENGTH,
} from '../algoConstants'
import { AlgorandPublicKey, AlgorandSignature, AlgorandPrivateKey, AlgorandAddress } from '../models'

/**
 * ConcatArrays takes two array and returns a joint Uint8 array of both
 */
export function concatUint8Arrays(a: any, b: any): Uint8Array {
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
  return Crypto.Ed25519Crypto.isValidPublicKey(Helpers.hexStringToByteArray(value))
}

export function isValidAlgorandPrivateKey(value: string): value is AlgorandPrivateKey {
  return Crypto.Ed25519Crypto.isValidPrivateKey(Helpers.hexStringToByteArray(value))
}

// TODO: Improve validation rule for signature - check byte length of signature?
export function isValidAlgorandSignature(signature: string): boolean {
  if (Helpers.isNullOrEmpty(signature)) return false
  return Helpers.isAUint8Array(Helpers.hexStringToByteArray(signature))
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

// todo algo - use sdk's address.encode and .decode functions instead of copying

/** Computes algorand address from the algorand public key */
export function toAddressFromPublicKey(publicKey: AlgorandPublicKey): AlgorandAddress {
  const rawPublicKey = Helpers.hexStringToByteArray(publicKey)
  // compute checksum
  const checksum = genericHash(rawPublicKey).slice(
    nacl.sign.publicKeyLength - ALGORAND_CHECKSUM_BYTE_LENGTH,
    nacl.sign.publicKeyLength,
  )
  const address = base32.encode(concatUint8Arrays(rawPublicKey, checksum))
  return address.toString().slice(0, ALGORAND_ADDRESS_LENGTH) // removing the extra '===='
}

/** Computes algorand public key from the algorand address */
// note: copied from algosdk address.decode
export function toPublicKeyFromAddress(address: AlgorandAddress): AlgorandPublicKey {
  const ADDRESS_MALFORMED_ERROR = 'address seems to be malformed'
  if (!Helpers.isAString(address)) throw new Error(ADDRESS_MALFORMED_ERROR)

  // try to decode
  const decoded = base32.decode.asBytes(address)

  // Sanity check
  if (decoded.length !== ALGORAND_ADDRESS_BYTES_ONLY_LENGTH) throw new Error(ADDRESS_MALFORMED_ERROR)

  const publicKey = new Uint8Array(decoded.slice(0, ALGORAND_ADDRESS_BYTES_ONLY_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH))
  return Helpers.byteArrayToHexString(publicKey) as AlgorandPublicKey
}

// convert a native signature (Uint8Array OR Buffer of Uint8Array) to Hexstring
export function toAlgorandSignatureFromRawSig(rawSignature: Buffer | Uint8Array): AlgorandSignature {
  if (Helpers.isNullOrEmpty(rawSignature)) return null
  let sigUint8 = rawSignature
  if (Helpers.isABuffer(rawSignature)) {
    sigUint8 = Helpers.bufferToUint8Array(rawSignature as Buffer)
  }
  return toAlgorandSignature(Helpers.byteArrayToHexString(sigUint8))
}

// convert a native Uint8Array signature to Hexstring
export function toRawSignatureFromAlgoSig(signature: AlgorandSignature): Uint8Array {
  return Helpers.hexStringToByteArray(signature)
}

/** Throws if signatures isn't properly formatted */
export function assertValidSignatures(signatures: AlgorandSignature[]) {
  ;(signatures || []).forEach(sig => {
    if (!isValidAlgorandSignature(sig)) {
      Errors.throwNewError(`Not a valid signature : ${sig}`, 'signature_invalid')
    }
  })
}
