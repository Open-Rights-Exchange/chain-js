// TODO: update types for EthPublicKey and EthPrivateKey
/** a public key string - formatted correctly for ETH */
export type EthPublicKey = any

/** a private key string - formatted correctly for ETH */
export type EthPrivateKey = string

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a signature string - formatted correcly for ETH */
export type EthSignature = ECDSASignature
