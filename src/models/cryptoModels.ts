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

/** Stringified JSON ciphertext (used for private keys) */
export type EncryptedDataString = string & EncryptedDataStringBrand
/** a public key string - formatted correctly for the chain */
// TODO: eth public key is of type buffer
export type PublicKey = (string & PublicKeyBrand) | any
/** a private key string - formatted correctly for the chain */
export type PrivateKey = string & PrivateKeyBrand
/** a signature string - formatted correcly for the chain */
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
