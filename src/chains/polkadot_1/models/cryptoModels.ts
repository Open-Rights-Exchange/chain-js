import { Ed25519Crypto } from '../../../crypto'
import { PublicKeyBrand, PrivateKeyBrand, SignatureBrand, ModelsCryptoAes, ChainEntityNameBrand } from '../../../models'

export enum PolkadotCurve {
  Ed25519 = 'ed25519',
  Sr25519 = 'sr25519',
  Secp256k1 = 'secp256k1',
}

export enum PolkadotKeyPairType {
  Ed25519 = 'ed25519',
  Sr25519 = 'sr25519',
  Ecdsa = 'ecdsa',
  Ethereum = 'ethereum',
}

export type PolkadotNewKeysOptions = {
  keyPairType?: PolkadotKeyPairType
  phrase?: string
  derivationPath?: string
}

/** an address string - formatted correctly for polkadot */
export type PolkadotAddress = string

/** will be used as accountName */
export type PolkadotEntityName = string & ChainEntityNameBrand

/** a private key string - formatted correctly for polkadot */
export type PolkadotPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for polkadot */
export type PolkadotPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for polkadot */
export type PolkadotSignature = string & SignatureBrand

/** key pair - in the format returned from algosdk */
export type PolkadotKeypair = {
  type: PolkadotKeyPairType
  publicKey: PolkadotPublicKey
  privateKey: PolkadotPrivateKey
  privateKeyEncrypted?: ModelsCryptoAes.AesEncryptedDataString | Ed25519Crypto.Ed25519EncryptedDataString
}

/** options used to convert a password and salt into a passowrd key */
export type PolkadotEncryptionOptions =
  | ModelsCryptoAes.AesEncryptionOptions
  | Ed25519Crypto.Ed25519PasswordEncryptionOptions

/** Additional parameters for encryption/decryption */
export type EncryptionOptions = PolkadotEncryptionOptions
