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

export enum EthUnit {
  Noether = 'noether',
  Wei = 'wei',
  Kwei = 'kwei',
  Babbage = 'babbage',
  femtoether = 'femtoether',
  Mwei = 'mwei',
  Lovelace = 'lovelace',
  Picoether = 'picoether',
  Qwei = 'gwei',
  Gwei = 'Gwei',
  Shannon = 'shannon',
  Nanoether = 'nanoether',
  Nano = 'nano',
  Szabo = 'szabo',
  Microether = 'microether',
  Micro = 'micro',
  Finney = 'finney',
  Milliether = 'milliether',
  Milli = 'milli',
  Ether = 'ether',
  Kether = 'kether',
  Grand = 'grand',
  Mether = 'mether',
  Gether = 'gether',
  Thether = 'tether',
}
