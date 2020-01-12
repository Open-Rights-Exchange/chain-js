import { EncryptedDataString, PublicKeyBrand, PrivateKeyBrand, SignatureBrand } from '../../../models'

export type EosPublicKey = string & PublicKeyBrand
export type EosPrivateKey = string & PrivateKeyBrand
export type EosSignature = string & SignatureBrand

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
