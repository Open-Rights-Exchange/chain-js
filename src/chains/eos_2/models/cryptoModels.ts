import { ModelsCryptoSymmetric, PublicKeyBrand, PrivateKeyBrand, SignatureBrand } from '../../../models'

/** a public key string - formatted correctly for EOS */
export type EosPublicKey = string & PublicKeyBrand
/** a private key string - formatted correctly for EOS */
export type EosPrivateKey = string & PrivateKeyBrand
/** a signature string - formatted correcly for EOS */
export type EosSignature = string & SignatureBrand

/** key pair - in the format returned from algosdk */
export type EosKeyPair = {
  publicKey: EosPublicKey
  privateKey: EosPrivateKey | ModelsCryptoSymmetric.EncryptedDataString
}

/** An object containing public and private keys for owner and active permissions */
export type EosAccountKeys = {
  publicKeys: {
    owner: EosPublicKey
    active: EosPublicKey
  }
  privateKeys: {
    owner: EosPrivateKey | ModelsCryptoSymmetric.EncryptedDataString
    active: EosPrivateKey | ModelsCryptoSymmetric.EncryptedDataString
  }
}
