import { EncryptedDataString, PublicKeyBrand, PrivateKeyBrand, SignatureBrand } from '../../../models'

/** a public key string - formatted correctly for EOS */
export type EosPublicKey = string & PublicKeyBrand
/** a private key string - formatted correctly for EOS */
export type EosPrivateKey = string & PrivateKeyBrand
/** a signature string - formatted correcly for EOS */
export type EosSignature = string & SignatureBrand

/** An object containing public and private keys for owner and active permissions */
export type EosAccountKeysStruct = {
  publicKeys: {
    owner: EosPublicKey
    active: EosPublicKey
  }
  privateKeys: {
    owner: EosPrivateKey | EncryptedDataString
    active: EosPrivateKey | EncryptedDataString
  }
}
