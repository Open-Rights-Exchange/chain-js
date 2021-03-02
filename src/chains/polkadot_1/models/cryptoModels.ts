import { PublicKeyBrand, PrivateKeyBrand, SignatureBrand } from '../../../models'

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
  phrase?: string
  keyType?: PolkadotKeyPairType
  derivationPath?: string
}

/** a private key string - formatted correctly for polkadot */
export type PolkadotPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for polkadot */
export type PolkadotPublicKey = string & PublicKeyBrand

/** a signature string - formatted correcly for polkadot */
export type PolkadotSignature = string & SignatureBrand // TODO: Use Polkadot SDK to define type

/** key pair - in the format returned from algosdk */
export type PolkadotKeypair = {
  type: PolkadotKeyPairType
  publicKey: PolkadotPublicKey
  privateKey: PolkadotPrivateKey
  // privateKeyEncrypted?: ModelsCryptoAes.AesEncryptedDataString
}
