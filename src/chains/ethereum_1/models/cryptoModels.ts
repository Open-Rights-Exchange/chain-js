import { SignatureBrand, PrivateKeyBrand, PublicKeyBrand } from '../../../models'
import * as aesCrypto from '../../../crypto/aesCrypto'

/** an ethereum transaction signature */
export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

export type EncryptionMode = aesCrypto.EncryptionMode

/** a private key string - formatted correctly for ethereum */
export type EthereumPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for ethereum */
export type EthereumPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for ethereum */
export type EthereumSignature = ECDSASignature & SignatureBrand
