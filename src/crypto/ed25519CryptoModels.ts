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
