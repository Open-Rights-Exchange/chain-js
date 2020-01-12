/** Brand signifiying a valid value - assigned by using toPublicKey */
export enum PublicKeyBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toPrivateKey */
export enum PrivateKeyBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toSignature */
export enum SignatureBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toEncryptedDataString */
export enum EncryptedDataStringBrand {
  _ = '',
}

export type EncryptedDataString = string & EncryptedDataStringBrand
export type PublicKey = string & PublicKeyBrand
export type PrivateKey = string & PrivateKeyBrand
export type Signature = string & SignatureBrand

export type KeyPair = {
  public: PublicKey
  private: PrivateKey
}

export type KeyPairEncrypted = {
  public: PublicKey
  privateEncrypted: EncryptedDataString
}

export type AccountKeysStruct = {
  publicKeys: {
    active: PublicKey
  }
  privateKeys: {
    active: PrivateKey | EncryptedDataString
  }
}
