/** Stringified JSON ciphertext (used for private keys) */
export type Ed25519EncryptedDataString = string & Ed25519EncryptedDataStringBrand

/** Brand signifiying a valid value - assigned by using toEd25519EncryptedDataString */
export enum Ed25519EncryptedDataStringBrand {
  _ = '',
}

export type Ed25519PrivateKey = Uint8Array

export type Ed25519Signature = Uint8Array

export type Ed25519PublicKey = Uint8Array

export type Ed25519KeyPair = {
  publicKey: Ed25519PublicKey
  secretKey: Ed25519PrivateKey
}

export type Ed25519PasswordEncryptionOptions = {
  salt?: string
  N?: number
  r?: number
  p?: number
  dkLen?: number
  encoding?: string
}

/** Ed25519 encypted data object - just a string */
export type Ed25519EncryptedData = string
