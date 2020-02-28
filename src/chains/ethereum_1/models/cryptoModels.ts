import { SignatureBrand } from '../../../models'

/** a public key string - formatted correctly for ETH */
export type EthPublicKey = Buffer

/** a private key string - formatted correctly for ETH */
export type EthPrivateKey = Buffer

export type EthAddress = string

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a signature string - formatted correcly for ETH */
export type EthSignature = ECDSASignature & SignatureBrand
