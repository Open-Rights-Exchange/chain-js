import { Ed25519Crypto } from '../../../crypto'
import { ChainEntityNameBrand, PrivateKeyBrand, PublicKeyBrand, SignatureBrand } from '../../../models'

/** an address string - formatted correctly for algorand */
export type AlgorandAddress = string
/** will be used as accountName */
export type AlgorandEntityName = string & ChainEntityNameBrand
/** key pair - in the format returned from algosdk */
export type AlgorandKeyPair = {
  publicKey: AlgorandPublicKey
  privateKey: AlgorandPrivateKey | Ed25519Crypto.Ed25519EncryptedDataString
}

/** a private key string - formatted correctly for algorand */
export type AlgorandPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for algorand */
export type AlgorandPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for algorand */
export type AlgorandSignature = string & SignatureBrand

/** options used to convert a password and salt into a passowrd key */
export type AlgoEncryptionOptions = Ed25519Crypto.Ed25519PasswordEncryptionOptions

/** Additional parameters for encryption/decryption - for SHA256 algorithm */
export type EncryptionOptions = AlgoEncryptionOptions
