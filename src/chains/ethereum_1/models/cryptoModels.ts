import { SignatureBrand, PrivateKeyBrand, PublicKeyBrand, ModelsCryptoAes } from '../../../models'

/** an ethereum transaction signature */
export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a private key string - formatted correctly for ethereum */
export type EthereumPrivateKey = string & PrivateKeyBrand

/** a public key string - formatted correctly for ethereum */
export type EthereumPublicKey = string & PublicKeyBrand

/** a native Ethereum ECDSA signature structure */
export type EthereumSignature = ECDSASignature & SignatureBrand

/** a stringified Ethereum signature - may have diff underlying formats (e.g. multisig) */
export type EthereumSignatureString = string & SignatureBrand

/** key pair - in the format returned from algosdk */
export type EthereumKeyPair = {
  publicKey: EthereumPublicKey
  privateKey: EthereumPrivateKey
  privateKeyEncrypted?: ModelsCryptoAes.AesEncryptedDataString
}
