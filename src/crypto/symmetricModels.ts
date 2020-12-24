/** Encryption modes supported by crypto library (default is gcm) */
export enum EncryptionMode {
  Gcm = 'gcm',
  Ccm = 'ccm',
  Ocb2 = 'ocb2',
  Cbc = 'cbc',
}

export enum EncryptionCipher {
  Aes = 'aes',
}

/** Parameters for encryption/decryption - for SHA256 algorithm */
export type EncryptionOptions = {
  salt?: string
  iter?: number
  mode?: EncryptionMode
  iv?: string
}

export type EncryptedSymmetric = {
  iv?: string
  iter: number
  v: number
  ks: number
  ts: number
  mode: EncryptionMode
  adata: string
  cipher: EncryptionCipher
  ct: string
}
