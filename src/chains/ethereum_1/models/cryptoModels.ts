import { SignatureBrand, PrivateKeyBrand } from '../../../models'

/** a public key string - formatted correctly for ETH */
export type EthPublicKey = string

/** a private key string - formatted correctly for ETH */
export type EthPrivateKey = string & PrivateKeyBrand

export type EthAddress = string

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a signature string - formatted correcly for ETH */
export type EthSignature = ECDSASignature & SignatureBrand
