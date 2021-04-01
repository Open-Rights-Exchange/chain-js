// This code from https://github.com/bin-y/standard-ecies
// Implemention of ECIES specified in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme

import crypto from 'crypto'

/** data to encrypt (or result of decrypt) */
export type Unencrypted = string | NodeJS.ArrayBufferView

/** Stringified JSON ciphertext (used for private keys) */
export type AsymmetricEncryptedDataString = string & AsymmetricEncryptedDataStringBrand

/** Brand signifiying a valid value - assigned by using toSymEncryptedDataString */
export enum AsymmetricEncryptedDataStringBrand {
  _ = '',
}

/** Possible symmetric cypher types */
export enum SymmetricCypherType {
  Aes128Ecb = 'aes-128-ecb',
  Aes256Ctr = 'aes-256-ctr',
  Sha256 = 'sha256',
}

export type ECDHKeyFormat = 'compressed' | 'uncompressed' | 'hybrid'
export type CipherGCMTypes =
  | crypto.CipherGCMTypes // cipher types supported by Node (depends on version of Node)
  | SymmetricCypherType.Aes128Ecb
  | SymmetricCypherType.Sha256
  | SymmetricCypherType.Aes256Ctr
export enum EciesCurveType {
  Secp256k1 = 'secp256k1',
  Ed25519 = 'ed25519',
}

/** Informational string added to encrypted results - useful when decrypting in determining set of options used
 * e.g. 'chainjs.ethereum.secp256k1.v2' */
export type Scheme = string

export type EciesOptions = {
  hashCypherType?: SymmetricCypherType
  macCipherType?: SymmetricCypherType // e.g. 'sha256'
  curveType?: EciesCurveType // e.g. 'secp256k1' or 'ed25519'
  symmetricCypherType?: SymmetricCypherType
  keyFormat?: ECDHKeyFormat
  /** Optional Initialization Vector (as Hex string) */
  iv?: string
  /** Optional message/secret to share in encrypted payload (as Utf8 string) */
  s1?: string
  /** Optional message/secret to share in encrypted payload (as Utf8 string) */
  s2?: string
  // Informational string added to encrypted results - useful when decrypting in determining set of options used
  // e.g. 'chainjs.ethereum.secp256k1.v2'
  scheme?: Scheme
}

export type EciesOptionsAsBuffers = {
  hashCypherType?: SymmetricCypherType
  macCipherType?: SymmetricCypherType // e.g. 'sha256'
  curveType?: EciesCurveType // e.g. 'secp256k1' or 'ed25519'
  symmetricCypherType?: SymmetricCypherType
  keyFormat?: ECDHKeyFormat
  /** Optional Initialization Vector (as Hex string) */
  iv?: Buffer
  /** Optional message/secret to share in encrypted payload (as Utf8 string) */
  s1?: Buffer
  /** Optional message/secret to share in encrypted payload (as Utf8 string) */
  s2?: Buffer
  // Informational string added to encrypted results - useful when decrypting in determining set of options used
  // e.g. 'chainjs.ethereum.secp256k1.v2'
  scheme?: Scheme
}

/** Asymmetric encypted data object
 * all values are hex strings */
export type AsymmetricEncryptedData = {
  /** 0-based order of encryption - used when 'wrapping' with mulitple asymmetric encryptions in a sequence */
  seq?: number
  iv: string
  publicKey: string
  ephemPublicKey: string
  ciphertext?: string
  mac: string
  scheme?: Scheme
}

/** Passed into encryptWithPublicKey & decryptWithPublicKey to allow custom cipherkey & mackey generation */
export type CustomMessageKeyGenerator = (
  sharedSecret?: Buffer | Uint8Array,
  s1?: Buffer,
  ephemKeyBuffer?: Buffer,
) => { cipherKey: Buffer; macKey: Buffer }

/** Passed into encryptWithPublicKey & decryptWithPublicKey to allow custom mac generation */
export type CustomMacGenerator = (macKey?: Buffer, s2?: Buffer, cipherText?: Buffer) => Buffer

/** Custom way to compose an asymmetic encyption payload */
export type CustomAsymmetricScheme = {
  /** unique name that defines the details of how cipher key and mac key were composed (e.g. compressed or umcompressed public key) */
  scheme: string
  /** function to generate a cipher key in a 'custom' way */
  customMessageKeyGenerator: CustomMessageKeyGenerator
  /** function to generate a mac key in a 'custom' way */
  customMacGenerator: CustomMacGenerator
}
