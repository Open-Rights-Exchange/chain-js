// This code from https://github.com/bin-y/standard-ecies
// Implemention of ECIES specified in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme

import crypto from 'crypto'

/** data to encrypt (or result of decrypt) */
export type Unencrypted = string | NodeJS.ArrayBufferView

export type ECDHKeyFormat = 'compressed' | 'uncompressed' | 'hybrid'
export type CipherGCMTypes = crypto.CipherGCMTypes | 'aes-128-ecb' | 'sha256'
export enum EciesCurveType {
  Secp256k1 = 'secp256k1',
  Ed25519 = 'ed25519',
}

// Informational string added to encrypted results - useful when decrypting in determining set of options used
// e.g. 'chainjs.ethereum.secp256k1.v2'
export type Scheme = string

export type EciesOptions = {
  hashCypherType?: CipherGCMTypes
  macCipherType?: CipherGCMTypes // e.g. 'sha256'
  curveType?: EciesCurveType // e.g. 'secp256k1' or 'ed25519'
  symmetricCypherType?: CipherGCMTypes
  keyFormat?: ECDHKeyFormat
  iv?: Buffer
  s1?: Buffer
  s2?: Buffer
}

/** all values are hex strings */
export type EncryptedAsymmetric = {
  /** 0-based order of encryption - used when 'wrapping' with mulitple asymmetric encryptions in a sequence */
  seq?: number
  iv: string
  publicKey: string
  ephemPublicKey: string
  ciphertext?: string
  mac: string
}
