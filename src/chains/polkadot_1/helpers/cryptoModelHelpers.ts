/* eslint-disable @typescript-eslint/no-unused-vars */
import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { signatureVerify } from '@polkadot/util-crypto'
import {
  ensureHexPrefix,
  isNullOrEmpty,
  isABuffer,
  isAString,
  isHexString,
  hexStringToByteArray,
  byteArrayToHexString,
  notSupported,
} from '../../../helpers'
import {
  PolkadotPublicKey,
  PolkadotPrivateKey,
  PolkadotSignature,
  PolkadotAddress,
  PolkadotKeyPairType,
} from '../models'
import { CryptoCurve } from '../../../models'
import { AesCrypto, Ed25519Crypto } from '../../../crypto'

/** determine crypto curve from key type */
export function getCurveFromKeyType(keyPairType: PolkadotKeyPairType): CryptoCurve {
  switch (keyPairType) {
    case PolkadotKeyPairType.Ecdsa:
      return CryptoCurve.Secp256k1
    case PolkadotKeyPairType.Ethereum:
      return CryptoCurve.Secp256k1
    case PolkadotKeyPairType.Ed25519:
      return CryptoCurve.Ed25519
    case PolkadotKeyPairType.Sr25519:
      return CryptoCurve.Sr25519
    default:
      notSupported(`Keytype ${keyPairType}`)
      return null
  }
}

// todo eth - this should not have copied code - is the bug worked-around? if not, we should consider using a diff library
// Reimplemented from ethereumjs-util module to workaround a current bug
/** Checks if a valid signature with ECDSASignature */
export function isValidSignature(value: string | PolkadotSignature, keyPairType?: PolkadotKeyPairType): boolean {
  // TODO
  return true
}

export function isValidPolkadotPublicKey(
  value: string | PolkadotPublicKey,
  keyPairType?: PolkadotKeyPairType,
): value is PolkadotPublicKey {
  // TODO
  return true
  // if (!value) return false
  // return isValidPublic(toEthBuffer(ensureHexPrefix(value)))
}

export function isValidPolkadotPrivateKey(
  value: PolkadotPrivateKey | string,
  keyPairType?: PolkadotKeyPairType,
): value is PolkadotPrivateKey {
  // TODO, if curve param provided, check is valid for that type of curve
  // if no curve param, check each curve until valid match - or return false
  // check is valid for any of the supported curves
  return true
  // if (!value) return false
  // return isValidPrivate(toEthBuffer(ensureHexPrefix(value)))
}

export function isValidPolkadotSignature(value: PolkadotSignature | string): value is PolkadotSignature {
  // TODO
  return true
}

/** Whether value is well-formatted address */
export function isValidPolkadotAddress(value: string | Buffer | PolkadotAddress): boolean {
  // TODO: confirm this works with different curves
  if (!value) return false
  try {
    encodeAddress(isHexString(value) ? hexStringToByteArray(value as string) : decodeAddress(value))
  } catch (error) {
    return false
  }
  return true
}

/** Accepts hex string checks if a valid polkadot public key
 *  Returns PolkadotPublicKey with prefix
 */
export function toPolkadotPublicKey(value: string): PolkadotPublicKey {
  if (isValidPolkadotPublicKey(value)) {
    return value as PolkadotPublicKey
  }
  throw new Error(`Not a valid polkadot public key:${value}.`)
}

/** Accepts hex string checks if a valid polkadot private key
 *  Returns PolkadotPrivateKey with prefix
 */
export function toPolkadotPrivateKey(value: string): PolkadotPrivateKey {
  if (isValidPolkadotPrivateKey(value)) {
    return value as PolkadotPrivateKey
  }
  throw new Error(`Not a valid polkadot private key:${value}.`)
}

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isSymEncryptedDataString(
  value: string,
  keyPairType?: PolkadotKeyPairType,
): value is AesCrypto.AesEncryptedDataString | Ed25519Crypto.Ed25519EncryptedDataString {
  const curve = getCurveFromKeyType(keyPairType)
  if (curve === CryptoCurve.Secp256k1) return AesCrypto.isAesEncryptedDataString(value)
  if (curve === CryptoCurve.Ed25519) return Ed25519Crypto.isEd25519EncryptedDataString(value)
  // if no curve param, check all possible options
  return AesCrypto.isAesEncryptedDataString(value) || Ed25519Crypto.isEd25519EncryptedDataString(value)
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toSymEncryptedDataString(
  value: any,
  keyPairType?: PolkadotKeyPairType,
): AesCrypto.AesEncryptedDataString | Ed25519Crypto.Ed25519EncryptedDataString {
  const curve = getCurveFromKeyType(keyPairType)
  if (curve === CryptoCurve.Secp256k1) return AesCrypto.toAesEncryptedDataString(value)
  if (curve === CryptoCurve.Ed25519) return Ed25519Crypto.toEd25519EncryptedDataString(value)
  throw new Error(`Curve not supported ${curve}`)
}

/**
 *  Returns PolkadotSignature
 */
export function toPolkadotSignature(value: string | PolkadotSignature): PolkadotSignature {
  if (isValidPolkadotSignature(value)) {
    return value
  }
  throw new Error(`Not a valid polkadot signature:${JSON.stringify(value)}.`)
}

/** Accepts hex string checks if a valid address
 *  Returns PolkadotAddress with prefix
 */
export function toPolkadotAddress(value: string): PolkadotAddress {
  if (isValidPolkadotAddress(value)) {
    return value
  }
  throw new Error(`Not a valid polkadot address:${value}.`)
}

/** verifies a signature is valid for a message body and address */
export function verifySignatureWithAddress(
  signedMessage: string,
  signature: string,
  address: PolkadotPublicKey,
): boolean {
  const publicKey = decodeAddress(address)
  const hexPublicKey = byteArrayToHexString(publicKey)

  return signatureVerify(signedMessage, signature, hexPublicKey).isValid
}
