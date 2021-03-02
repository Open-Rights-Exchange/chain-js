import { u8aToHex } from '@polkadot/util'
import {
  encodeAddress,
  decodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  naclKeypairFromSeed,
  schnorrkelKeypairFromSeed,
  secp256k1KeypairFromSeed,
  signatureVerify,
} from '@polkadot/util-crypto'
import { Keypair, Seedpair, KeypairType } from '@polkadot/util-crypto/types'
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

export const keypairFromSeed = {
  ecdsa: (seed: Uint8Array): Keypair => secp256k1KeypairFromSeed(seed) as Keypair,
  ed25519: (seed: Uint8Array): Keypair => naclKeypairFromSeed(seed) as Keypair,
  sr25519: (seed: Uint8Array): Keypair => schnorrkelKeypairFromSeed(seed) as Keypair,
}

export function getPolkadotAddressFromPublicKey(publicKey: PolkadotPublicKey): PolkadotAddress {
  return encodeAddress(publicKey)
}

export function generateNewAccountPhrase(): string {
  const mnemonic = mnemonicGenerate()
  return mnemonic
}

export function getKeypairFromPhrase(mnemonic: string, type: PolkadotCurve): PolkadotKeypair {
  const seed = mnemonicToMiniSecret(mnemonic)
  const keyPair = keypairFromSeed[type](seed)
  return keyPair
}

// export function verifySignatureWithAddress(
//   signedMessage: string,
//   signature: string,
//   address: PolkadotPublicKey,
// ): boolean {
//   const publicKey = decodeAddress(address)
//   const hexPublicKey = u8aToHex(publicKey)

//   return signatureVerify(signedMessage, signature, hexPublicKey).isValid
// }

// export function determineCurveFromAddress() {}

// export function determineCurveFromKeyPair() {
//   // itererate verify - trying each curve
// }

const ETHEREUM_ASYMMETRIC_SCHEME_NAME = 'asym.chainjs.secp256k1.ethereum'

// eslint-disable-next-line prefer-destructuring
export const defaultIter = AesCrypto.defaultIter
// eslint-disable-next-line prefer-destructuring
export const defaultMode = AesCrypto.defaultMode

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isSymEncryptedDataString(value: string): value is AesCrypto.AesEncryptedDataString {
  return AesCrypto.isAesEncryptedDataString(value)
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toSymEncryptedDataString(value: any): AesCrypto.AesEncryptedDataString {
  return AesCrypto.toAesEncryptedDataString(value)
}

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
    scheme: ETHEREUM_ASYMMETRIC_SCHEME_NAME,
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

// /** Returns public key from ethereum address */
// export function getEthereumAddressFromPublicKey(publicKey: EthereumPublicKey): EthereumAddress {
//   return bufferToHex(publicToAddress(toEthBuffer(publicKey)))
// }

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
    privateKey: keys?.privateKey,
    publicKey: keys?.publicKey,
    privateKeyEncrypted,
  }
  return encryptedKeys
}

/** Generates and returns a new public/private key pair */
export async function generateKeyPair(): Promise<EthereumKeyPair> {
  notImplemented()
  const wallet = Wallet.generate()
  const privateKey: PolkadotPrivateKey = wallet.getPrivateKeyString()
  const publicKey: PolkadotPublicKey = wallet.getPublicKeyString()
  const keys: PolkadotKeypair = { privateKey, publicKey }
  return keys
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

/** determine crypto curve from key type */
export function getCurveFromKeyType(keyType: PolkadotKeyPairType): PolkadotCurve {
  switch (keyType) {
    case PolkadotKeyPairType.Ecdsa:
      return PolkadotCurve.Secp256k1
    case PolkadotKeyPairType.Ethereum:
      return PolkadotCurve.Secp256k1
    case PolkadotKeyPairType.Ed25519:
      return PolkadotCurve.Ed25519
    case PolkadotKeyPairType.Sr25519:
      return PolkadotCurve.Sr25519
    default:
      notSupported(`Keytype ${keyType}`)
      return null
  }
}
