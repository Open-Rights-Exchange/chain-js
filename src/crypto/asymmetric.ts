// This code from https://github.com/bin-y/standard-ecies
// Implemention of ECIES specified in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme
import crypto from 'crypto'
import { ecdsaSign, ecdsaVerify } from 'secp256k1'
import {
  byteArrayToHexString,
  createSha256Hash,
  isABuffer,
  isAString,
  isBase64Encoded,
  isHexString,
  isNullOrEmpty,
  utf8StringToHexString,
} from '../helpers'
import { throwNewError } from '../errors'
import { ensureEncryptedValueIsObject } from './genericCryptoHelpers'
import {
  generateEphemPublicKeyAndSharedSecretType1,
  generateSharedSecretType1,
  generateEphemPublicKeyAndSharedSecretEd25519,
  generateSharedSecretEd25519,
} from './diffieHellman'
import {
  AsymmetricEncryptedData,
  AsymmetricEncryptedDataString,
  CipherGCMTypes,
  ECDHKeyFormat,
  EciesCurveType,
  EciesOptions,
  EciesOptionsAsBuffers,
  AsymmetricScheme,
  SymmetricCypherType,
  Unencrypted,
} from './asymmetricModels'
import { PrivateKey, PublicKey, Signature } from '../models'
import { getAsymSchemeGenerator } from './asymmetricSchemes/asymmetricSchemeGetter'

export * from './asymmetricModels'

// ECIES details in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme
/** default options for ECIES Assymetric encryption (encrypt with public key, decrypt with private key) */
export const DefaultEciesOptions: any = {
  hashCypherType: SymmetricCypherType.Sha256,
  macCipherType: SymmetricCypherType.Sha256,
  curveType: EciesCurveType.Secp256k1,
  symmetricCypherType: SymmetricCypherType.Aes256Ctr,
  /** iv is used in symmetric cipher
   * set iv=null if the cipher does not need an initialization vector (e.g. a cipher in ecb mode)
   * Set iv=undefined to use deprecated createCipheriv / createDecipher / EVP_BytesToKey */
  keyFormat: 'compressed',
}

export const emptyBuffer = Buffer.allocUnsafe ? Buffer.allocUnsafe(0) : Buffer.from([])
/** compose the right length of empty buffer for a specific cypherType */
export function emptyBufferForIv(symmetricCypherType: SymmetricCypherType) {
  // aes-256-ctr requires a buffer value to exist
  if (symmetricCypherType === SymmetricCypherType.Aes256Ctr) {
    return Buffer.alloc(16)
  }
  return emptyBuffer
}

/** Verifies that the value is a valid, stringified JSON Encrypted object */
export function isAsymEncryptedDataString(value: string): value is AsymmetricEncryptedDataString {
  if (!isAString(value)) return false
  // this is an oversimplified check just to prevent assigning a wrong string
  return value.match(/^(?=.*\bpublicKey\b)(?=.*\bephemPublicKey\b)(?=.*\b)(?=.*\bmac\b).*$/is) !== null
}

/** Ensures that the value comforms to a well-formed, stringified JSON Encrypted Object */
export function toAsymEncryptedDataString(value: any): AsymmetricEncryptedDataString {
  if (isAsymEncryptedDataString(value)) {
    return value
  }
  throw new Error(`Not valid asymmetric encrypted data string:${value}`)
}

/** Perform Symetric Encryption */
function symmetricEncrypt(
  cypherName: CipherGCMTypes,
  iv: Buffer,
  key: crypto.CipherKey | crypto.BinaryLike,
  plaintext: Unencrypted,
) {
  let cipher
  let useIv = iv
  if (iv === undefined) {
    cipher = crypto.createCipher(cypherName, key as crypto.BinaryLike)
  } else {
    if (iv === null) {
      // to support node 6.x
      useIv = emptyBuffer
    }
    cipher = crypto.createCipheriv(cypherName, key as crypto.CipherKey, useIv)
  }
  const firstChunk = cipher.update(plaintext)
  const secondChunk = cipher.final()
  return Buffer.concat([firstChunk, secondChunk])
}

/** Perform Symetric Decryption */
function symmetricDecrypt(
  cypherName: CipherGCMTypes,
  iv: Buffer,
  key: crypto.CipherKey | crypto.BinaryLike,
  ciphertext: NodeJS.ArrayBufferView,
): Buffer {
  let cipher
  let useIv = iv
  if (iv === undefined) {
    cipher = crypto.createDecipher(cypherName, key as crypto.BinaryLike)
  } else {
    if (iv === null) {
      // to support node 6.x
      useIv = emptyBuffer
    }
    cipher = crypto.createDecipheriv(cypherName, key as crypto.CipherKey, useIv)
  }
  const firstChunk = cipher.update(ciphertext)
  const secondChunk = cipher.final()
  return Buffer.concat([firstChunk, secondChunk])
}

// Compare two buffers in constant time to prevent timing attacks.
function equalConstTime(b1: Buffer, b2: Buffer) {
  if (b1.length !== b2.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < b1.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    result |= b1[i] ^ b2[i]
  }
  return result === 0
}

/** Populate missing options with default values
 *  Convert iv, s1, s2 from strings to buffers */
function composeOptions(optionsIn: EciesOptions): EciesOptionsAsBuffers {
  const { s1: s1In, s2: s2In, ...otherOptions } = optionsIn || {}
  let { iv: ivIn } = optionsIn || {}

  const newOptions: Partial<EciesOptionsAsBuffers> = {
    ...DefaultEciesOptions,
    ...(otherOptions || {}),
  }

  if (newOptions.symmetricCypherType === undefined) {
    newOptions.symmetricCypherType = DefaultEciesOptions.symmetricCypherType
    ivIn = undefined // use options.iv to determine is the cypher in ecb mode
  }

  // iv should be a Buffer or null or undefined - retain either undefined or null - used in symmetricEncrypt for diff examples
  let iv: Buffer
  if (!isNullOrEmpty(ivIn)) {
    iv = Buffer.from(ivIn, 'hex')
  } else if (ivIn === undefined) {
    iv = emptyBufferForIv(newOptions.symmetricCypherType)
  } else if (ivIn === null) {
    iv = null
  }
  const s1: Buffer = !isNullOrEmpty(s1In) ? Buffer.from(s1In, 'utf8') : emptyBuffer
  const s2: Buffer = !isNullOrEmpty(s2In) ? Buffer.from(s2In, 'utf8') : emptyBuffer

  newOptions.iv = iv
  newOptions.s1 = s1
  newOptions.s2 = s2

  return newOptions
}

/** return default asymmetric encryption scheme notation for a given curve */
function getDefaultScheme(curveType: EciesCurveType): AsymmetricScheme {
  if (curveType === EciesCurveType.Ed25519) return AsymmetricScheme.DEFAULT_ED25519_ASYMMETRIC_SCHEME_NAME
  if (curveType === EciesCurveType.Secp256k1) return AsymmetricScheme.DEFAULT_SECP256K1_ASYMMETRIC_SCHEME_NAME
  return null
}

function generateSharedSecretAndEphemPublicKey(
  publicKey: NodeJS.ArrayBufferView,
  curveType: EciesCurveType,
  keyFormat?: ECDHKeyFormat,
) {
  let result
  if (curveType === EciesCurveType.Secp256k1) {
    result = generateEphemPublicKeyAndSharedSecretType1(publicKey, curveType, keyFormat)
  }
  if (curveType === EciesCurveType.Ed25519) {
    result = generateEphemPublicKeyAndSharedSecretEd25519(publicKey as Uint8Array)
  }
  if (!result) {
    throwNewError('Not supported CurveType')
  }
  return result
}

function generateSharedSecretUsingPrivateKey(
  privateKey: NodeJS.ArrayBufferView,
  ephemPublicKey: string,
  curveType: EciesCurveType,
) {
  let sharedSecret
  let ephemPublicKeyBuffer
  if (curveType === EciesCurveType.Secp256k1) {
    ephemPublicKeyBuffer = Buffer.from(ephemPublicKey, 'hex')
    sharedSecret = generateSharedSecretType1(ephemPublicKeyBuffer, privateKey, curveType)
  }
  if (curveType === EciesCurveType.Ed25519) {
    ephemPublicKeyBuffer = Buffer.from(ephemPublicKey, 'hex')
    sharedSecret = generateSharedSecretEd25519(ephemPublicKeyBuffer, privateKey as Uint8Array)
  }

  return { ephemPublicKeyBuffer, sharedSecret }
}

function convertEphemPublicKeyToBuffer(ephemPublicKey: string | Buffer): Buffer {
  if (isHexString(ephemPublicKey)) {
    return Buffer.from(ephemPublicKey as string, 'hex')
  }
  if (isBase64Encoded(ephemPublicKey)) {
    return Buffer.from(ephemPublicKey as string, 'base64')
  }
  if (isABuffer(ephemPublicKey)) {
    return ephemPublicKey as Buffer
  }
  throwNewError('Invalid ephemPublicKey format. Expected Buffer, Hex or Base64 String')
  return Buffer.alloc(0)
}

/** ECDH encryption using publicKey */
export function encryptWithPublicKey(
  publicKey: string, // hex string
  plainText: string,
  options?: EciesOptions,
): AsymmetricEncryptedData {
  const useOptions = composeOptions(options)
  const publicKeyBuffer = Buffer.from(publicKey, 'hex')
  const { ephemPublicKey, sharedSecret } = generateSharedSecretAndEphemPublicKey(
    publicKeyBuffer,
    useOptions?.curveType,
    useOptions?.keyFormat,
  )

  const asymSchemeGenerator = getAsymSchemeGenerator(useOptions?.scheme)
  const { messageKeyGenerator, macGenerator } = asymSchemeGenerator

  const ephemBuffer = convertEphemPublicKeyToBuffer(ephemPublicKey)

  const { cipherKey, macKey } = messageKeyGenerator(sharedSecret, useOptions.s1, ephemBuffer)
  // let cipherKey
  // let macKey
  // if (customMessageKeyGenerator) {
  //   ;({ cipherKey, macKey } = messageKeyGenerator(sharedSecret, useOptions.s1, ephemBuffer))
  // } else {
  //   // uses KDF to derive a symmetric encryption and a MAC keys:
  //   // Ke || Km = KDF(S || S1)
  //   const hash = generateMessageHash(
  //     useOptions.hashCypherType,
  //     Buffer.concat([sharedSecret, useOptions.s1], sharedSecret.length + useOptions.s1.length),
  //   )
  //   cipherKey = hash.slice(0, hash.length / 2)
  //   macKey = hash.slice(hash.length / 2)
  // }

  // encrypts the message:
  // c = E(Ke; m);
  const cipherText = symmetricEncrypt(useOptions.symmetricCypherType, useOptions.iv, cipherKey, plainText)

  const mac = macGenerator(macKey, useOptions.s2, cipherText)
  // let mac
  // if (macGenerator) {
  //   mac = macGenerator(macKey, useOptions.s2, cipherText)
  // } else {
  //   // computes the tag of encrypted message and S2:
  //   // d = MAC(Km; c || S2)
  //   mac = generateMessageMac(
  //     useOptions.macCipherType,
  //     macKey,
  //     Buffer.concat([cipherText, useOptions.s2], cipherText.length + useOptions.s2.length),
  //   )
  // }

  const result: AsymmetricEncryptedData = {
    iv: !isNullOrEmpty(useOptions?.iv) ? useOptions.iv.toString('hex') : null,
    publicKey,
    ephemPublicKey: Buffer.from(ephemBuffer).toString('hex'),
    ciphertext: cipherText.toString('hex'),
    mac: Buffer.from(mac).toString('hex'),
  }

  // if we're using a customAsymScheme, use that provided scheme name
  const scheme = useOptions?.scheme || getDefaultScheme(useOptions?.curveType)
  if (scheme) result.scheme = scheme

  return result
}

/** ECDH decryption using privateKey */
export function decryptWithPrivateKey(
  encrypted: AsymmetricEncryptedData,
  privateKey: string, // hex string
  options?: EciesOptions,
): string {
  // const { scheme: customScheme, messageKeyGenerator: customMessageKeyGenerator, macGenerator: customMacGenerator } =
  //   customAsymScheme || {}
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  const optionsWithScheme = {
    scheme: encryptedObject?.scheme,
    ...options,
  }
  const useOptions = composeOptions(optionsWithScheme)
  let decryptedBuffer: Buffer
  try {
    const cipherText = Buffer.from(encryptedObject.ciphertext, 'hex')
    const iv = !isNullOrEmpty(encryptedObject?.iv) ? Buffer.from(encryptedObject.iv, 'hex') : emptyBuffer
    const mac = Buffer.from(encryptedObject.mac, 'hex')
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
    const { sharedSecret } = generateSharedSecretUsingPrivateKey(
      privateKeyBuffer,
      encryptedObject.ephemPublicKey,
      useOptions?.curveType,
    )

    const asymSchemeGenerator = getAsymSchemeGenerator(useOptions?.scheme)
    const { messageKeyGenerator, macGenerator } = asymSchemeGenerator

    const ephemBuffer = convertEphemPublicKeyToBuffer(encryptedObject?.ephemPublicKey)

    const { cipherKey, macKey } = messageKeyGenerator(sharedSecret, useOptions.s1, ephemBuffer)

    // let cipherKey
    // let macKey
    // if (customMessageKeyGenerator) {
    //   // override with custom way to generate
    //   ;({ cipherKey, macKey } = customMessageKeyGenerator(sharedSecret, useOptions.s1, ephemBuffer))
    // } else {
    //   // uses KDF to derive a symmetric encryption and a MAC keys:
    //   // Ke || Km = KDF(S || S1)
    //   const hash = generateMessageHash(
    //     useOptions.hashCypherType,
    //     Buffer.concat([sharedSecret, useOptions.s1], sharedSecret.length + useOptions.s1.length),
    //   )
    //   cipherKey = hash.slice(0, hash.length / 2)
    //   macKey = hash.slice(hash.length / 2)
    // }

    // let compareMac
    // if (customMacGenerator) {
    //   compareMac = customMacGenerator(macKey, useOptions.s2, cipherText)
    // } else {
    //   // computes the tag of encrypted message and S2
    //   // d = MAC(Km; c || S2)
    //   compareMac = generateMessageMac(
    //     useOptions.macCipherType,
    //     macKey,
    //     Buffer.concat([cipherText, useOptions.s2], cipherText.length + useOptions.s2.length),
    //   )
    // }
    const compareMac = macGenerator(macKey, useOptions.s2, cipherText)

    // outputs failed if d != MAC(Km; c || S2)
    if (!equalConstTime(mac, compareMac)) {
      throwNewError('decryptWithPrivateKey: mac does not match - encrypted value may be corrupted')
    }
    // uses symmetric encryption to decrypt the message
    // m = E-1(Ke; c)
    decryptedBuffer = symmetricDecrypt(useOptions.symmetricCypherType, iv, cipherKey, cipherText)
  } catch (err) {
    // if we're using a customAsymScheme, use that provided scheme name
    const scheme = useOptions?.scheme || getDefaultScheme(useOptions?.curveType)
    if (encryptedObject?.scheme && scheme !== encryptedObject?.scheme) {
      err.message += `. Notice: scheme does not match - expected ${scheme}, encrypted value scheme:${encryptedObject?.scheme}`
    }
    throw err
  }
  return decryptedBuffer.toString()
}

/** Signs a string (utf8) using the private key (hex string) and returns a signature (hex string) */
export async function sign(value: string, privateKey: PrivateKey): Promise<Signature> {
  // convert value to hex string then create a hash of it
  const valueBuffer = new Uint8Array(Buffer.from(createSha256Hash(utf8StringToHexString(value)), 'hex'))
  const keyBuffer = new Uint8Array(Buffer.from(privateKey, 'hex'))
  const signResults = ecdsaSign(valueBuffer, keyBuffer)
  const signature = byteArrayToHexString(signResults.signature)
  return signature as Signature
}

/** Verifies the signature for the string and returns true if verification succeeded */
export function verifySignedWithPublicKey(value: string, publicKey: PublicKey, signature: Signature): boolean {
  const valueBuffer = new Uint8Array(Buffer.from(createSha256Hash(utf8StringToHexString(value)), 'hex'))
  const keyBuffer = new Uint8Array(Buffer.from(publicKey, 'hex'))
  const sigBuffer = new Uint8Array(Buffer.from(signature, 'hex'))
  return ecdsaVerify(sigBuffer, valueBuffer, keyBuffer)
}
