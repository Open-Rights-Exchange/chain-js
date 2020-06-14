import { PrivateKeyBrand, PublicKeyBrand, SignatureBrand } from '../../../models'

/** a private key string - formatted correctly for ethereum */
export type AlgorandPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for ethereum */
export type AlgorandPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for ethereum */
export type AlgorandSignature = Uint8Array & SignatureBrand
