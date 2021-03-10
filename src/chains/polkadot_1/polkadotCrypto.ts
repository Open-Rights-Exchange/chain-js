import {
  keyExtractSuri,
  keyFromPath,
  mnemonicGenerate,
  mnemonicToLegacySeed,
  mnemonicToMiniSecret,
  naclKeypairFromSeed,
  schnorrkelKeypairFromSeed,
  secp256k1KeypairFromSeed,
} from '@polkadot/util-crypto'
import { Keypair } from '@polkadot/util-crypto/types'
// import Keyring from '@polkadot/keyring'
import { isHex } from '@polkadot/util'
import secp256k1 from 'secp256k1'
import { DeriveJunction } from '@polkadot/util-crypto/key/DeriveJunction'
import {
  PolkadotEncryptionOptions,
  PolkadotKeypair,
  PolkadotKeyPairType,
  PolkadotPrivateKey,
  PolkadotPublicKey,
} from './models'
import { CryptoCurve, PublicKey } from '../../models'
import { AesCrypto, Asymmetric, Ed25519Crypto } from '../../crypto'
import { removeHexPrefix, byteArrayToHexString, hexStringToByteArray, notSupported, isInEnum } from '../../helpers'
import { ensureEncryptedValueIsObject } from '../../crypto/genericCryptoHelpers'
// import * as AsymmetricHelpers from '../../crypto/asymmetricHelpers'
import { throwNewError } from '../../errors'
import { getCurveFromKeyType, toPolkadotPrivateKey, toPolkadotPublicKey, toSymEncryptedDataString } from './helpers'

// TODO - should change depending on curve
const enum POLKADOT_ASYMMETRIC_SCHEME_NAME {
  Ed25519 = 'asym.chainjs.ed25519.polkadot',
  Secp256k1 = 'asym.chainjs.secp256k1.polkadot',
}

/** returns a keypair for a specific curve */
export function generateKeypairFromSeed(seed: Uint8Array, curve: CryptoCurve): Keypair {
  if (curve === CryptoCurve.Secp256k1) return secp256k1KeypairFromSeed(seed) as Keypair
  if (curve === CryptoCurve.Ed25519) return naclKeypairFromSeed(seed) as Keypair
  if (curve === CryptoCurve.Sr25519) return schnorrkelKeypairFromSeed(seed) as Keypair
  throwNewError(`Curve type not supported: ${curve}`)
  return null
}

export function generateNewAccountPhrase(): string {
  const mnemonic = mnemonicGenerate()
  return mnemonic
}

export function getKeypairFromPhrase(mnemonic: string, curve: CryptoCurve): Keypair {
  const seed = mnemonicToMiniSecret(mnemonic)
  const keyPair = generateKeypairFromSeed(seed, curve)
  return keyPair
}

/** get uncompressed public key from Ethereum key */
export function uncompressEthereumPublicKey(publicKey: PolkadotPublicKey): string {
  // if already decompressed an not has trailing 04
  const cleanedPublicKey = removeHexPrefix(publicKey)
  const testBuffer = Buffer.from(cleanedPublicKey, 'hex')
  const prefixedPublicKey = testBuffer.length === 64 ? `04${cleanedPublicKey}` : cleanedPublicKey
  const uncompressedPublicKey = byteArrayToHexString(
    secp256k1.publicKeyConvert(hexStringToByteArray(prefixedPublicKey), false),
  )
  return uncompressedPublicKey
}

/** Encrypts a string using a password and optional salt */
export function encryptWithPassword(
  unencrypted: string,
  password: string,
  options: PolkadotEncryptionOptions,
  keypairType?: PolkadotKeyPairType, // TODO: keypairType should be required
): AesCrypto.AesEncryptedDataString | Ed25519Crypto.Ed25519EncryptedDataString {
  // TODO: Define Src25519 curve
  const curve = getCurveFromKeyType(keypairType)
  if (curve === CryptoCurve.Ed25519) {
    const passwordKey = Ed25519Crypto.calculatePasswordByteArray(password, options)
    const encrypted = Ed25519Crypto.encrypt(unencrypted, passwordKey)
    return toSymEncryptedDataString(encrypted, keypairType)
  }
  if (curve === CryptoCurve.Secp256k1) return AesCrypto.encryptWithPassword(unencrypted, password, options)
  // if no curve, throw an error - curve not supported
  throw new Error(`Curve not supported ${curve}`)
}

/** Decrypts the encrypted value using a password, and optional salt using secp256k1, and nacl
 * The encrypted value is either a stringified JSON object or a JSON object */
export function decryptWithPassword(
  encrypted: AesCrypto.AesEncryptedDataString | Ed25519Crypto.Ed25519EncryptedDataString | any,
  password: string,
  options: PolkadotEncryptionOptions,
  keypairType?: PolkadotKeyPairType, // TODO: keypairType should be required
): string {
  // TODO: Define Src25519 curve
  const curve = getCurveFromKeyType(keypairType)
  if (curve === CryptoCurve.Ed25519) {
    const passwordKey = Ed25519Crypto.calculatePasswordByteArray(password, options)
    const decrypted = Ed25519Crypto.decrypt(encrypted, passwordKey)
    return decrypted
  }
  if (curve === CryptoCurve.Secp256k1) return AesCrypto.decryptWithPassword(encrypted, password, options)
  // if no curve, throw an error - curve not supported
  throw new Error(`Curve not supported ${curve}`)
}

/** uncompress public key based on keypairType */
export function uncompressPublicKey(
  publicKey: PolkadotPublicKey,
  keypairType: PolkadotKeyPairType,
): { curveType: Asymmetric.EciesCurveType; publicKeyUncompressed: PublicKey; scheme: POLKADOT_ASYMMETRIC_SCHEME_NAME } {
  let scheme: POLKADOT_ASYMMETRIC_SCHEME_NAME
  let curveType: Asymmetric.EciesCurveType
  let publicKeyUncompressed
  if (keypairType === PolkadotKeyPairType.Ecdsa) {
    // TODO: confirm that ecdsa is uncompressed, might be same as Ethereum
    publicKeyUncompressed = publicKey
  } else if (keypairType === PolkadotKeyPairType.Ethereum) {
    publicKeyUncompressed = uncompressEthereumPublicKey(publicKey)
    curveType = Asymmetric.EciesCurveType.Secp256k1
    scheme = POLKADOT_ASYMMETRIC_SCHEME_NAME.Secp256k1
  } else if (keypairType === PolkadotKeyPairType.Ed25519) {
    publicKeyUncompressed = publicKey
    curveType = Asymmetric.EciesCurveType.Ed25519
    scheme = POLKADOT_ASYMMETRIC_SCHEME_NAME.Ed25519
  } else if (keypairType === PolkadotKeyPairType.Sr25519) {
    // TODO: add
  } else {
    notSupported(`uncompressPublicKey keypairType: ${keypairType}`)
  }
  return { curveType, publicKeyUncompressed, scheme }
}

/** Encrypts a string using a public key into a stringified JSON object
 * The encrypted result can be decrypted with the matching private key */
export async function encryptWithPublicKey(
  unencrypted: string,
  publicKey: PolkadotPublicKey,
  options: Asymmetric.EciesOptions,
  keypairType?: PolkadotKeyPairType, // TODO: keypairType should be required
): Promise<Asymmetric.AsymmetricEncryptedDataString> {
  const { curveType, publicKeyUncompressed, scheme } = uncompressPublicKey(publicKey, keypairType)
  const useOptions = {
    ...options,
    curveType,
    scheme,
  }
  const response = Asymmetric.encryptWithPublicKey(publicKeyUncompressed, unencrypted, useOptions)
  return Asymmetric.toAsymEncryptedDataString(JSON.stringify(response))
}

// TODO: Refactor - Tray - reuse functions across chains

/** Decrypts the encrypted value using a private key
 * The encrypted value is a stringified JSON object
 * ... and must have been encrypted with the public key that matches the private ley provided */
export async function decryptWithPrivateKey(
  encrypted: Asymmetric.AsymmetricEncryptedDataString | Asymmetric.AsymmetricEncryptedData,
  privateKey: PolkadotPrivateKey,
  options: Asymmetric.EciesOptions,
  keypairType?: PolkadotKeyPairType, // TODO: keypairType should be required
): Promise<string> {
  const curve = getCurveFromKeyType(keypairType) // TODO: Should be keypairtype not curve
  let useOptions = { ...options }
  let privateKeyConverted = ''
  if (curve === CryptoCurve.Secp256k1) {
    useOptions = { ...useOptions, curveType: Asymmetric.EciesCurveType.Secp256k1 }
    privateKeyConverted = removeHexPrefix(privateKey)
  } else if (curve === CryptoCurve.Ed25519) {
    useOptions = { ...useOptions, curveType: Asymmetric.EciesCurveType.Ed25519 }
    privateKeyConverted = privateKey.slice(0, privateKey.length / 2)
  } else {
    // if no curve matched, throw an error - not supported curve
    throw new Error(`Curve not supported ${curve}`)
  }
  const encryptedObject = ensureEncryptedValueIsObject(encrypted) as Asymmetric.AsymmetricEncryptedData
  return Asymmetric.decryptWithPrivateKey(encryptedObject, privateKeyConverted, useOptions)
}

/** Encrypts a string using multiple assymmetric encryptions with multiple public keys - one after the other
 *  calls a helper function to perform the iterative wrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to encryptWithPublicKey
 *  The result is stringified JSON object including an array of encryption results with the last one including the final cipertext
 *  Encrypts using publicKeys in the order they appear in the array */
// export async function encryptWithPublicKeys(
//   unencrypted: string,
//   publicKeys: PolkadotPublicKey[],
//   keypairType: PolkadotKeyPairType[],
//   options?: Asymmetric.EciesOptions,
// ): Promise<Asymmetric.AsymmetricEncryptedDataString> {
//   // TODO: Make sure to change asymmetricHelpers.encryptWithPublicKeys or nor
//   notImplemented()
//   return null
//   return Asymmetric.toAsymEncryptedDataString(
//     await AsymmetricHelpers.encryptWithPublicKeys(encryptWithPublicKey, unencrypted, publicKeys, options),
//   )
// }

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
 *  calls a helper function to perform the iterative unwrapping
 *  the first parameter of the helper is a chain-specific function (in this file) to decryptWithPrivateKey
 *  Decrypts using privateKeys that match the publicKeys provided in encryptWithPublicKeys() - provide the privateKeys in same order
 *  The result is the decrypted string */
// export async function decryptWithPrivateKeys(
//   encrypted: Asymmetric.AsymmetricEncryptedDataString,
//   privateKeys: PolkadotPublicKey[],
// ): Promise<string> {
//   // TODO: Make sure to change asymmetricHelpers.encryptWithPublicKeys or nor
//   notImplemented()
//   return null
//   return AsymmetricHelpers.decryptWithPrivateKeys(decryptWithPrivateKey, encrypted, privateKeys, {})
// }

/** Signs data with private key */
// export function sign(data: string | Buffer, privateKey: string): PolkadotSignature {
//   notImplemented()
//   // todo: data should be hashed first using ethereum-js-tx Transaction.prototype.hash
//   const dataBuffer = toEthBuffer(data)
//   const keyBuffer = toBuffer(privateKey, 'hex')
//   return toEthereumSignature(ecsign(dataBuffer, keyBuffer))
// }

/** Derive a seed from a mnemoic (and optional derivation path) */
function generateSeedFromMnemonic(
  keypairType: PolkadotKeyPairType,
  mnemonic: string,
  derivationPath?: string,
): { seed: Uint8Array; path: DeriveJunction[] } {
  const suri = derivationPath !== undefined ? `${mnemonic}//${derivationPath}` : mnemonic
  const { password, path, phrase } = keyExtractSuri(suri)
  let seed: Uint8Array
  if (isHex(phrase, 256)) {
    seed = hexStringToByteArray(phrase)
  } else {
    const str = phrase as string
    const parts = str.split(' ')
    if ([12, 15, 18, 21, 24].includes(parts.length)) {
      seed =
        keypairType === PolkadotKeyPairType.Ethereum
          ? mnemonicToLegacySeed(phrase)
          : mnemonicToMiniSecret(phrase, password)
    } else {
      throw new Error('Specified phrase is not a valild mnemonic and is invalid as a raw seed at > 32 bytes')
    }
  }
  return { seed, path }
}

/** Generates and returns a new public/private key pair
 *  Supports optional key gen from mnemonic phase
 * Note: Reference - createFromUri from @polkadot/keyring
 * https://github.com/polkadot-js/common/blob/master/packages/keyring/src/keyring.ts#L197
 */
export async function generateKeyPair(
  keypairType?: PolkadotKeyPairType,
  mnemonic?: string,
  derivationPath?: string,
): Promise<PolkadotKeypair> {
  const curve = getCurveFromKeyType(keypairType)
  const overrideMnemonic = mnemonic || generateNewAccountPhrase()
  const { seed, path } = generateSeedFromMnemonic(keypairType, overrideMnemonic, derivationPath)
  const derivedKeypair = keyFromPath(generateKeypairFromSeed(seed, curve), path, keypairType)
  const keypair: PolkadotKeypair = {
    type: keypairType,
    publicKey: toPolkadotPublicKey(byteArrayToHexString(derivedKeypair.publicKey)),
    privateKey: toPolkadotPrivateKey(byteArrayToHexString(derivedKeypair.secretKey)),
  }
  return keypair
}

/** Adds privateKeyEncrypted if missing by encrypting privateKey (using password) */
function encryptAccountPrivateKeysIfNeeded(
  keys: PolkadotKeypair,
  password: string,
  options: PolkadotEncryptionOptions,
): PolkadotKeypair {
  const privateKeyEncrypted = keys.privateKeyEncrypted
    ? keys.privateKeyEncrypted
    : encryptWithPassword(keys.privateKey, password, options, keys.type)
  const encryptedKeys: PolkadotKeypair = {
    type: keys.type,
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    privateKeyEncrypted,
  }
  return encryptedKeys
}

/** Generates new public and private key pair
 * Encrypts the private key using password and optional salt
 */
export async function generateNewAccountKeysAndEncryptPrivateKeys(
  password: string,
  keypairType: PolkadotKeyPairType,
  options: PolkadotEncryptionOptions,
): Promise<PolkadotKeypair> {
  const keys = await generateKeyPair(keypairType)
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password, options)
  return encryptedKeys
}

// export function determineCurveFromAddress() {}

// export function determineCurveFromKeyPair() {
//   // itererate verify - trying each curve
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

// /** Returns public key from polkadot address */
// export function getPolkadotAddressFromPublicKey(publicKey: PolkadotPublicKey): PolkadotAddress {
//   notImplemented()
// }

// /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
// export function verifySignedWithPublicKey(
//   data: string | Buffer,
//   publicKey: PolkadotPublicKey,
//   signature: PolkadotSignature,
// ): boolean {
//   notImplemented()
//   return null
// }
