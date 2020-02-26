// import { EncryptedDataString, PublicKeyBrand, PrivateKeyBrand, SignatureBrand } from '../../../models'

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a signature string - formatted correcly for ETH */
export type EthSignature = ECDSASignature
