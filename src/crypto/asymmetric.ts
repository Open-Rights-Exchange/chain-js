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
import {
  CipherGCMTypes,
  ECDHKeyFormat,
  EciesCurveType,
  EciesOptions,
  EncryptedAsymmetric,
  Unencrypted,
} from './asymmetricModels'

export * from './asymmetricModels'

export const emptyBuffer = Buffer.allocUnsafe ? Buffer.allocUnsafe(0) : Buffer.from([])

// ECIES details in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme
/** default options for ECIES Assymetric encryption (encrypt with public key, decrypt with private key) */
export const DefaultEciesOptions: EciesOptions = {
  hashCypherType: 'sha256',
  macCipherType: 'sha256',
  curveType: EciesCurveType.Secp256k1,
  symmetricCypherType: 'aes-128-ecb',
  /** iv is used in symmetric cipher
   * set iv=null if the cipher does not need an initialization vector (e.g. a cipher in ecb mode)
   * Set iv=undefined to use deprecated createCipheriv / createDecipher / EVP_BytesToKey */
  iv: emptyBuffer,
  keyFormat: 'uncompressed',
  s1: emptyBuffer, // optional shared secret 1
  s2: emptyBuffer, // optional shared secret 2
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

// KDF
function hashMessage(cypherName: CipherGCMTypes, message: Unencrypted) {
  return crypto
    .createHash(cypherName)
    .update(message)
    .digest()
}

// MAC
function macMessage(cypherName: CipherGCMTypes, key: crypto.CipherKey, message: Unencrypted) {
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
function composeOptions(optionsIn: EciesOptions) {
  const options: EciesOptions = { ...DefaultEciesOptions, ...(optionsIn || {}) }
  if (options.symmetricCypherType === undefined) {
    options.symmetricCypherType = DefaultEciesOptions.symmetricCypherType
    options.iv = emptyBuffer // use options.iv to determine is the cypher in ecb mode
  }
  return options
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
    const decodedPublicKey = decodeBase64(ephemPublicKeyBuffer.toString())
    sharedSecret = generateSharedSecretEd25519(decodedPublicKey, privateKey as Uint8Array)
  }

  return { ephemPublicKeyBuffer, sharedSecret }
}

/** ECDH encryption using publicKey */
export function encryptWithPublicKey(
  publicKey: string, // hex string
  plainText: string,
  options?: EciesOptions,
): EncryptedAsymmetric {
  const useOptions = composeOptions(options)
  const publicKeyBuffer = Buffer.from(publicKey, 'hex')
  const { ephemPublicKey, sharedSecret } = generateSharedSecretAndEphemPublicKey(
    publicKeyBuffer,
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

  return {
    iv: !isNullOrEmpty(useOptions?.iv) ? useOptions.iv.toString('hex') : null,
    publicKey,
    ephemPublicKey: Buffer.from(ephemPublicKey).toString('hex'),
    ciphertext: ciphertext.toString('hex'),
    mac: Buffer.from(mac).toString('hex'),
  }
}

/** ECDH decryption using privateKey */
export function decryptWithPrivateKey(
  encrypted: EncryptedAsymmetric,
  privateKey: string, // hex string
  options?: EciesOptions,
): string {
  const useOptions = composeOptions(options)
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  const cipherText = Buffer.from(encryptedObject.ciphertext, 'hex')
  const iv = !isNullOrEmpty(encryptedObject?.iv) ? Buffer.from(encryptedObject.iv, 'hex') : emptyBuffer
  const mac = Buffer.from(encryptedObject.mac, 'hex')
  const privateKeyBuffer = Buffer.from(privateKey, 'hex')
  const { sharedSecret } = generateSharedSecretUsingPrivateKey(
    privateKeyBuffer,
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
    throwNewError('decryptWithPrivateKey: mac does not match - encrypted value may be corrupted')
  }

  // uses symmetric encryption scheme to decrypt the message
  // m = E-1(Ke; c)
  const buffer = symmetricDecrypt(useOptions.symmetricCypherType, iv, encryptionKey, cipherText)
  return buffer.toString()
}
