/** a public key string - formatted correctly for ETH */
export type EthereumPublicKey = Buffer

/** a private key string - formatted correctly for ETH */
export type EthereumPrivateKey = Buffer

// use it as account name
export type EthereumAddress = string

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/** a signature string - formatted correcly for ETH */
export type EthereumSignature = ECDSASignature
