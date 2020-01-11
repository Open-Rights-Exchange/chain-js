import { EncryptedDataString } from '../../../crypto'

export enum EosPublicKeyBrand {
  _ = '',
}
export enum EosPrivateKeyBrand {
  _ = '',
}
export enum EosSignatureBrand {
  _ = '',
}

export type EosPublicKey = string & EosPublicKeyBrand
export type EosPrivateKey = string & EosPrivateKeyBrand
export type EosSignature = string & EosSignatureBrand

export type KeyPair = {
  public: EosPublicKey
  private: EosPrivateKey
}

export type KeyPairEncrypted = {
  public: EosPublicKey
  privateEncrypted: EncryptedDataString
}

export type AccountKeysStruct = {
  publicKeys: {
    owner: EosPublicKey
    active: EosPublicKey
  }
  privateKeys: {
    owner: EosPrivateKey | EncryptedDataString
    active: EosPrivateKey | EncryptedDataString
  }
}
