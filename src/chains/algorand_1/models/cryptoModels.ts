import { PrivateKeyBrand, PublicKeyBrand, SignatureBrand } from '../../../models'

/** an address string - formatted correctly for algorand */
export type AlgorandAddress = string

/** key pair - in the format returned from algosdk */
export type AlgorandKeyPair = {
  publicKey: AlgorandPublicKey
  privateKey: AlgorandPrivateKey
}

/** a private key string - formatted correctly for algorand */
export type AlgorandPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for algorand */
export type AlgorandPublicKey = string & PublicKeyBrand

/**  Raw format required to sign any transaction */
export type AlgorandRawPrivateKey = Uint8Array

/** a signature string - formatted correcly for algorand */
export type AlgorandSignature = Uint8Array & SignatureBrand

/** a signature object for multisig transaction */
export type AlgorandMultiSignature = { pk: Uint8Array; s?: Uint8Array }
