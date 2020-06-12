import { EncryptedDataString, PublicKeyBrand, PrivateKeyBrand, SignatureBrand } from '../../../models'
import * as aesCrypto from '../../../crypto/aesCrypto'

/** a public key string - formatted correctly for EOS */
export type EosPublicKey = string & PublicKeyBrand
/** a private key string - formatted correctly for EOS */
export type EosPrivateKey = string & PrivateKeyBrand
/** a signature string - formatted correcly for EOS */
export type EosSignature = string & SignatureBrand

/** An object containing public and private keys for owner and active permissions */
export type EosAccountKeys = {
  publicKeys: {
    owner: EosPublicKey
    active: EosPublicKey
  }
  privateKeys: {
    owner: EosPrivateKey | EncryptedDataString
    active: EosPrivateKey | EncryptedDataString
  }
}

/** Additional parameters for encryption/decryption - for SHA256 algorithm */
export type EncryptionOptions = aesCrypto.AesEncryptionOptions

/** Encryption modes supported by crypto library (default is gcm) */
export type EncryptionMode = aesCrypto.EncryptionMode
