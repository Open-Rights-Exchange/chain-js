import { u8aToHex } from '@polkadot/util'
import {
  encodeAddress,
  decodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  naclKeypairFromSeed,
  schnorrkelKeypairFromSeed,
  secp256k1KeypairFromSeed,
} from '@polkadot/util-crypto'
import { Keypair, Seedpair } from '@polkadot/util-crypto/types'
import secp256k1 from 'secp256k1'
import {
  PolkadotAddress,
  PolkadotCurve,
  PolkadotKeypair,
  PolkadotKeyPairType,
  PolkadotPrivateKey,
  PolkadotPublicKey,
  PolkadotSignature,
} from './models'
import { AesCrypto, Asymmetric } from '../../crypto'
import {
  notImplemented,
  removeHexPrefix,
  byteArrayToHexString,
  hexStringToByteArray,
  notSupported,
} from '../../helpers'
import { ensureEncryptedValueIsObject } from '../../crypto/genericCryptoHelpers'
import * as AsymmetricHelpers from '../../crypto/asymmetricHelpers'
import { throwNewError } from '../../errors'

// TODO - should change depending on curve
const POLKADOT_ASYMMETRIC_SCHEME_NAME = 'asym.chainjs.secp256k1.polkadot'

/** returns a keypair for a specific curve */
export function generateKeypairFromSeed(seed: Uint8Array, curve: PolkadotCurve): Keypair {
  if (curve === PolkadotCurve.Secp256k1) return secp256k1KeypairFromSeed(seed) as Keypair
  if (curve === PolkadotCurve.Ed25519) return naclKeypairFromSeed(seed) as Keypair
  if (curve === PolkadotCurve.Sr25519) return schnorrkelKeypairFromSeed(seed) as Keypair
  throwNewError(`Curve type not supported: ${curve}`)
  return null
}

export function getPolkadotAddressFromPublicKey(publicKey: PolkadotPublicKey): PolkadotAddress {
  return encodeAddress(publicKey)
}

export function generateNewAccountPhrase(): string {
  const mnemonic = mnemonicGenerate()
  return mnemonic
}

export function getKeypairFromPhrase(mnemonic: string, curve: PolkadotCurve): Keypair {
  const seed = mnemonicToMiniSecret(mnemonic)
  const keyPair = generateKeypairFromSeed(seed, curve)
  return keyPair
}

// export function determineCurveFromAddress() {}

// export function determineCurveFromKeyPair() {
//   // itererate verify - trying each curve
// }

// eslint-disable-next-line prefer-destructuring
export const defaultIter = AesCrypto.defaultIter
// eslint-disable-next-line prefer-destructuring
export const defaultMode = AesCrypto.defaultMode

/** get uncompressed public key from EthereumPublicKey */
export function uncompressPublicKey(publicKey: PolkadotPublicKey): string {
  notImplemented()
  // if already decompressed an not has trailing 04
  const cleanedPublicKey = removeHexPrefix(publicKey)
  const testBuffer = Buffer.from(cleanedPublicKey, 'hex')
  const prefixedPublicKey = testBuffer.length === 64 ? `04${cleanedPublicKey}` : cleanedPublicKey
  const uncompressedPublicKey = byteArrayToHexString(
    secp256k1.publicKeyConvert(hexStringToByteArray(prefixedPublicKey), false),
  )
  return uncompressedPublicKey
}

/** Decrypts the encrypted value using a password, and optional salt using AES algorithm and SHA256 hash function
 * The encrypted value is either a stringified JSON object or a JSON object */
export function decryptWithPassword(
  encrypted: AesCrypto.AesEncryptedDataString | any,
  password: string,
  options: AesCrypto.AesEncryptionOptions,
): string {
  notImplemented()
  return AesCrypto.decryptWithPassword(encrypted, password, options)
}

/** Encrypts a string using a password and optional salt */
export function encryptWithPassword(
  unencrypted: string,
  password: string,
  options: AesCrypto.AesEncryptionOptions,
): AesCrypto.AesEncryptedDataString {
  notImplemented()
  return AesCrypto.encryptWithPassword(unencrypted, password, options)
}

/** Encrypts a string using a public key into a stringified JSON object
 * The encrypted result can be decrypted with the matching private key */
export async function encryptWithPublicKey(
  unencrypted: string,
  publicKey: PolkadotPublicKey,
  options: Asymmetric.EciesOptions,
): Promise<Asymmetric.AsymmetricEncryptedDataString> {
  notImplemented()
  const publicKeyUncompressed = uncompressPublicKey(publicKey) // should be hex string
  const useOptions = {
    ...options,
    curveType: Asymmetric.EciesCurveType.Secp256k1,
    scheme: POLKADOT_ASYMMETRIC_SCHEME_NAME,
  }
  const response = Asymmetric.encryptWithPublicKey(publicKeyUncompressed, unencrypted, useOptions)
  return Asymmetric.toAsymEncryptedDataString(JSON.stringify(response))
}

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: Asymmetric.AsymmetricEncryptedDataString | Asymmetric.AsymmetricEncryptedData,
  privateKey: PolkadotPrivateKey,
  options: Asymmetric.EciesOptions,
): Promise<string> {
  notImplemented()
  const useOptions = { ...options, curveType: Asymmetric.EciesCurveType.Secp256k1 }
  const privateKeyHex = removeHexPrefix(privateKey)
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  return Asymmetric.decryptWithPrivateKey(encryptedObject, privateKeyHex, useOptions)
}

/** Encrypts a string using multiple assymmetric encryptions with multiple public keys - one after the other
 *  calls a helper function to perform the iterative wrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to encryptWithPublicKey
 *  The result is stringified JSON object including an array of encryption results with the last one including the final cipertext
 *  Encrypts using publicKeys in the order they appear in the array */
export async function encryptWithPublicKeys(
  unencrypted: string,
  publicKeys: PolkadotPublicKey[],
  options?: Asymmetric.EciesOptions,
): Promise<Asymmetric.AsymmetricEncryptedDataString> {
  notImplemented()
  return Asymmetric.toAsymEncryptedDataString(
    await AsymmetricHelpers.encryptWithPublicKeys(encryptWithPublicKey, unencrypted, publicKeys, options),
  )
}

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
 *  calls a helper function to perform the iterative unwrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to decryptWithPrivateKey
 *  Decrypts using privateKeys that match the publicKeys provided in encryptWithPublicKeys() - provide the privateKeys in same order
 *  The result is the decrypted string */
export async function decryptWithPrivateKeys(
  encrypted: Asymmetric.AsymmetricEncryptedDataString,
  privateKeys: PolkadotPublicKey[],
): Promise<string> {
  notImplemented()
  return AsymmetricHelpers.decryptWithPrivateKeys(decryptWithPrivateKey, encrypted, privateKeys, {})
}

/** Signs data with private key */
// export function sign(data: string | Buffer, privateKey: string): PolkadotSignature {
//   notImplemented()
//   // todo: data should be hashed first using ethereum-js-tx Transaction.prototype.hash
//   const dataBuffer = toEthBuffer(data)
//   const keyBuffer = toBuffer(privateKey, 'hex')
//   return toEthereumSignature(ecsign(dataBuffer, keyBuffer))
// }

// /** Returns public key from ethereum signature */
// export function getEthereumPublicKeyFromSignature(
//   signature: EthereumSignature,
//   data: string | Buffer,
//   encoding: string,
// ): EthereumPublicKey {
//   const { v, r, s } = signature
//   return toEthereumPublicKey(ecrecover(toEthBuffer(data), v, r, s).toString())
// }

/** Returns public key from polkadot address */
export function getPolkadotAddressFromPublicKey(publicKey: PolkadotPublicKey): PolkadotAddress {
  notImplemented()
}

/** Adds privateKeyEncrypted if missing by encrypting privateKey (using password) */
function encryptAccountPrivateKeysIfNeeded(
  keys: PolkadotKeypair,
  password: string,
  options: AesCrypto.AesEncryptionOptions,
): PolkadotKeypair {
  // encrypt if not already encrypted
  notImplemented()
  const privateKeyEncrypted = keys?.privateKeyEncrypted
    ? keys.privateKeyEncrypted
    : encryptWithPassword(keys?.privateKey, password, options)
  const encryptedKeys: PolkadotKeypair = {
    type: keys?.type,
    privateKey: keys?.privateKey,
    publicKey: keys?.publicKey,
    privateKeyEncrypted,
  }
  return encryptedKeys
}

/** Generates and returns a new public/private key pair */
export async function generateKeyPair(
  keyPairType: PolkadotKeypairType,
  phrase?: string,
  derivationPath?: number,
): Promise<PolkadotKeypair> {
  const { newKeysOptions } = this._options
  // const { curve: type } = newKeysOptions || {}
  // const overrideType = type || 'ed25519'
  // const overridePhrase = generateNewAccountPhrase()
  // this._generatedKeypair = getKeypairFromPhrase(overridePhrase, overrideType)
  // this._options.publicKey = this._generatedKeypair.publicKey
  // this._options.newKeysOptions = {
  //   phrase: overridePhrase,
  //   curve: overrideType,
  // }
}

/** Generates new public and private key pair
 * Encrypts the private key using password and optional salt
 */
export async function generateNewAccountKeysAndEncryptPrivateKeys(
  password: string,
  overrideKeys: any,
  options: AesCrypto.AesEncryptionOptions,
): Promise<PolkadotKeypair> {
  notImplemented()
  const keys = await generateKeyPair()
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password, options)
  return encryptedKeys
}

/** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
export function verifySignedWithPublicKey(
  data: string | Buffer,
  publicKey: PolkadotPublicKey,
  signature: PolkadotSignature,
): boolean {
  notImplemented()
  return null
}
