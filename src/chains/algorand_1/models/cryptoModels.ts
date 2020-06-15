import { PrivateKeyBrand, PublicKeyBrand, SignatureBrand } from '../../../models'

/** an address string - formatted correctly for algorand */
export type AlgorandAddress = string

/** an account object - in the format returned from algosdk */
export type AlgorandAccount = {
  addr: AlgorandAddress
  sk: AlgorandPrivateKey
}

/** key pair - in the format returned from algosdk */
export type AlgorandKeyPair = {
  publicKey: AlgorandPublicKey
  privateKey: AlgorandPrivateKey
}

/** a private key string - formatted correctly for algorand */
export type AlgorandPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for algorand */
export type AlgorandPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for algorand */
export type AlgorandSignature = Uint8Array & SignatureBrand
