// import { Ed25519Crypto } from '../../../crypto'
// import { ChainEntityNameBrand, PrivateKeyBrand, PublicKeyBrand, SignatureBrand } from '../../../models'
import { Models, Crypto } from '@open-rights-exchange/chainjs'

/** an address string - formatted correctly for algorand */
export type AlgorandAddress = string
/** will be used as accountName */
export type AlgorandEntityName = string & Models.ChainEntityNameBrand
/** key pair - in the format returned from algosdk */
export type AlgorandKeyPair = {
  publicKey: AlgorandPublicKey
  privateKey: AlgorandPrivateKey
  privateKeyEncrypted?: Crypto.Ed25519Crypto.Ed25519EncryptedDataString
}

/** a private key string - formatted correctly for algorand */
export type AlgorandPrivateKey = string & Models.PrivateKeyBrand

/** a public key string - formatted correctly for algorand */
export type AlgorandPublicKey = string & Models.PublicKeyBrand

/** a signature string - formatted correcly for algorand */
export type AlgorandSignature = string & Models.SignatureBrand

/** options used to convert a password and salt into a passowrd key */
export type AlgoEncryptionOptions = Crypto.Ed25519Crypto.Ed25519PasswordEncryptionOptions

/** Additional parameters for encryption/decryption - for SHA256 algorithm */
export type EncryptionOptions = AlgoEncryptionOptions
