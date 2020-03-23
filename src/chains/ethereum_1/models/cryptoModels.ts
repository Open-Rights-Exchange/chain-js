import { SignatureBrand, PrivateKeyBrand, PublicKeyBrand } from '../../../models'

/** a public key string - formatted correctly for ethereum */
export type EthereumPublicKey = string & PublicKeyBrand

/** a private key string - formatted correctly for ethereum */
export type EthereumPrivateKey = string & PrivateKeyBrand

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a signature string - formatted correcly for ethereum */
export type EthereumSignature = ECDSASignature & SignatureBrand

export type EthUnit =
  | 'noether'
  | 'wei'
  | 'kwei'
  | 'Kwei'
  | 'babbage'
  | 'femtoether'
  | 'mwei'
  | 'Mwei'
  | 'lovelace'
  | 'picoether'
  | 'gwei'
  | 'Gwei'
  | 'shannon'
  | 'nanoether'
  | 'nano'
  | 'szabo'
  | 'microether'
  | 'micro'
  | 'finney'
  | 'milliether'
  | 'milli'
  | 'ether'
  | 'kether'
  | 'grand'
  | 'mether'
  | 'gether'
  | 'tether'
