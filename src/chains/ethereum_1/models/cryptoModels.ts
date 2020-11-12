import { SignatureBrand, PrivateKeyBrand, PublicKeyBrand } from '../../../models'

/** an ethereum transaction signature */
export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a private key string - formatted correctly for ethereum */
export type EthereumPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for ethereum */
export type EthereumPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for ethereum */
export type EthereumSignature = ECDSASignature & SignatureBrand
