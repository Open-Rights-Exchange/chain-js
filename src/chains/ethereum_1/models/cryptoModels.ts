import { SignatureBrand, PrivateKeyBrand, PublicKeyBrand } from '../../../models'
import * as aesCrypto from '../../../crypto/aesCrypto'

/** an ethereum transaction signature */
export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** Additional parameters for encryption/decryption - for SHA256 algorithm */
export type EncryptionOptions = aesCrypto.AesEncryptionOptions

/** Encryption modes supported by crypto library (default is gcm) */
export type EncryptionMode = aesCrypto.EncryptionMode

/** a private key string - formatted correctly for ethereum */
export type EthereumPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for ethereum */
export type EthereumPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for ethereum */
export type EthereumSignature = ECDSASignature & SignatureBrand
