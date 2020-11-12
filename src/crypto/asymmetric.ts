// This code from https://github.com/bin-y/standard-ecies
// Implemention of ECIES specified in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme

import crypto from 'crypto'
import { decodeBase64 } from 'tweetnacl-util'
import { isNullOrEmpty } from '../helpers'
import { throwNewError } from '../errors'
import { ensureEncryptedValueIsObject } from './cryptoHelpers'
import {
  generateEphemPublicKeyAndSharedSecretType1,
  generateSharedSecretType1,
  generateEphemPublicKeyAndSharedSecretEd25519,
  generateSharedSecretEd25519,
} from './diffieHellman'

const emptyBuffer = Buffer.allocUnsafe ? Buffer.allocUnsafe(0) : Buffer.from([])

type Data =
  | string
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array
  | DataView

export type ECDHKeyFormat = 'compressed' | 'uncompressed' | 'hybrid'
export type CipherGCMTypes = crypto.CipherGCMTypes | 'aes-128-ecb' | 'sha256'
export enum CurveType {
  Secp256k1 = 'secp256k1',
  Ed25519 = 'ed25519',
}

// Informational string added to encrypted results - useful when decrypting in determining set of options used
// e.g. 'chainjs.ethereum.secp256k1.v2'
export type Scheme = string

export type Options = {
  hashCypherType?: CipherGCMTypes
  macCipherType?: CipherGCMTypes // e.g. 'sha256'
  curveType?: CurveType // e.g. 'secp256k1' or 'ed25519'
  symmetricCypherType?: CipherGCMTypes
  keyFormat?: ECDHKeyFormat
  iv?: Buffer
  s1?: Buffer
  s2?: Buffer
  scheme?: Scheme
}

// ECIES details in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme
/** default options for ECIES Assymetric encryption (encrypt with public key, decrypt with private key) */
export const DefaultEciesOptions: Options = {
  hashCypherType: 'sha256',
  macCipherType: 'sha256',
  curveType: CurveType.Secp256k1,
  symmetricCypherType: 'aes-128-ecb',
  // iv is used in symmetric cipher, set null if the cipher does not need an
  // initialization vector (e.g. a cipher in ecb mode). Set undefined if you
  // want to use deprecated createCipheriv / createDecipher / EVP_BytesToKey
  iv: emptyBuffer,
  keyFormat: 'uncompressed',
  s1: emptyBuffer, // optional shared information1
  s2: emptyBuffer, // optional shared information2
}

/** Perform Symetric Encryption */
function symmetricEncrypt(
  cypherName: CipherGCMTypes,
  iv: Buffer,
  key: crypto.CipherKey | crypto.BinaryLike,
  plaintext: Data,
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
) {
  let cipher
  let useIv = iv
  if (iv === undefined) {
    cipher = crypto.createDecipher(cypherName, key as crypto.BinaryLike)
  } else {
    if (iv == null) {
      // to support node 6.x
      useIv = emptyBuffer
    }
    cipher = crypto.createDecipheriv(cypherName, key as crypto.CipherKey, useIv)
  }
  const firstChunk = cipher.update(ciphertext)
  const secondChunk = cipher.final()
  return Buffer.concat([firstChunk, secondChunk])
}

// KDF
function hashMessage(cypherName: CipherGCMTypes, message: Data) {
  return crypto
    .createHash(cypherName)
    .update(message)
    .digest()
}

// MAC
function macMessage(cypherName: CipherGCMTypes, key: crypto.CipherKey, message: Data) {
  return crypto
    .createHmac(cypherName, key)
    .update(message)
    .digest()
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

/** Populate missing options with default values */
function composeOptions(optionsIn: Options) {
  const options: Options = { ...DefaultEciesOptions, ...(optionsIn || {}) }
  if (options.symmetricCypherType === undefined) {
    options.symmetricCypherType = DefaultEciesOptions.symmetricCypherType
    options.iv = emptyBuffer // use options.iv to determine is the cypher in ecb mode
  }
  return options
}

/** all values are hex strings */
export type EncryptedAsymmetric = {
  iv: string
  ephemPublicKey: string
  ciphertext: string
  mac: string
}

function generateSharedSecretAndEphemPublicKey(
  publicKey: NodeJS.ArrayBufferView,
  curveType: CurveType,
  keyFormat?: ECDHKeyFormat,
) {
  let result
  if (curveType === CurveType.Secp256k1) {
    result = generateEphemPublicKeyAndSharedSecretType1(publicKey, curveType, keyFormat)
  }
  if (curveType === CurveType.Ed25519) {
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
  curveType: CurveType,
) {
  let sharedSecret
  let ephemPublicKeyBuffer
  if (curveType === CurveType.Secp256k1) {
    ephemPublicKeyBuffer = Buffer.from(ephemPublicKey, 'hex')
    sharedSecret = generateSharedSecretType1(ephemPublicKeyBuffer, privateKey, curveType)
  }
  if (curveType === CurveType.Ed25519) {
    ephemPublicKeyBuffer = Buffer.from(ephemPublicKey, 'hex')
    const decodedPublicKey = decodeBase64(ephemPublicKeyBuffer.toString())
    sharedSecret = generateSharedSecretEd25519(decodedPublicKey, privateKey as Uint8Array)
  }

  return { ephemPublicKeyBuffer, sharedSecret }
}

/** ECDH encryption using publicKey */
export function encryptWithPublicKey(
  publicKey: NodeJS.ArrayBufferView,
  plainText: string,
  options?: Options,
): EncryptedAsymmetric {
  const useOptions = composeOptions(options)
  const { ephemPublicKey, sharedSecret } = generateSharedSecretAndEphemPublicKey(
    publicKey,
    useOptions?.curveType,
    useOptions?.keyFormat,
  )
  // uses KDF to derive a symmetric encryption and a MAC keys:
  // Ke || Km = KDF(S || S1)
  const hash = hashMessage(
    useOptions.hashCypherType,
    Buffer.concat([sharedSecret, useOptions.s1], sharedSecret.length + useOptions.s1.length),
  )
  const encryptionKey = hash.slice(0, hash.length / 2)
  const macKey = hash.slice(hash.length / 2)

  // encrypts the message:
  // c = E(Ke; m);
  const ciphertext = symmetricEncrypt(useOptions.symmetricCypherType, useOptions.iv, encryptionKey, plainText)

  // computes the tag of encrypted message and S2:
  // d = MAC(Km; c || S2)
  const mac = macMessage(
    useOptions.macCipherType,
    macKey,
    Buffer.concat([ciphertext, useOptions.s2], ciphertext.length + useOptions.s2.length),
  )

  const iv = !isNullOrEmpty(useOptions?.iv) ? useOptions?.iv.toString('hex') : null

  return {
    iv,
    ephemPublicKey: Buffer.from(ephemPublicKey).toString('hex'),
    ciphertext: ciphertext.toString('hex'),
    mac: Buffer.from(mac).toString('hex'),
  }
}

/** ECDH decryption using privateKey */
export function decryptWithPrivateKey(
  encrypted: EncryptedAsymmetric,
  privateKey: NodeJS.ArrayBufferView,
  options?: Options,
) {
  const useOptions = composeOptions(options)
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  const cipherText = Buffer.from(encryptedObject.ciphertext, 'hex')
  const mac = Buffer.from(encryptedObject.mac, 'hex')
  const { sharedSecret } = generateSharedSecretUsingPrivateKey(
    privateKey,
    encryptedObject.ephemPublicKey,
    useOptions?.curveType,
  )

  // derives keys the same way as Alice did:
  // Ke || Km = KDF(S || S1)
  const hash = hashMessage(
    useOptions.hashCypherType,
    Buffer.concat([sharedSecret, useOptions.s1], sharedSecret.length + useOptions.s1.length),
  )
  // Ke
  const encryptionKey = hash.slice(0, hash.length / 2)
  // Km
  const macKey = hash.slice(hash.length / 2)

  // uses MAC to check the tag
  const keyTag = macMessage(
    useOptions.macCipherType,
    macKey,
    Buffer.concat([cipherText, useOptions.s2], cipherText.length + useOptions.s2.length),
  )

  // outputs failed if d != MAC(Km; c || S2);
  if (!equalConstTime(mac, keyTag)) {
    throwNewError('decrypt using private key: Bad MAC')
  }

  // uses symmetric encryption scheme to decrypt the message
  // m = E-1(Ke; c)
  return symmetricDecrypt(useOptions.symmetricCypherType, useOptions.iv, encryptionKey, cipherText).toString()
}
