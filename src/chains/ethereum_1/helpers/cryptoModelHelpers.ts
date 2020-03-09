import { ECDSASignature } from 'ethereumjs-util'
// eslint-disable-next-line import/no-cycle
import { isValidPrivateKey, isValidPublicKey, isValidSignature } from '../ethCrypto'
import { EthereumSignature, EthereumPublicKey, EthereumPrivateKey } from '../models/cryptoModels'

export function isValidEthereumSignature(value: EthereumSignature): value is EthereumSignature {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  return isValidSignature(value)
}
export function isValidEthereumPublicKey(value: string | EthereumPublicKey): value is EthereumPublicKey {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  return isValidPublicKey(value)
}

export function isValidEthereumPrivateKey(value: string | EthereumPrivateKey): value is EthereumPrivateKey {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  return isValidPrivateKey(value)
}

export function toEthereumPublicKey(value: string): EthereumPublicKey {
  if (isValidEthereumPublicKey(value)) {
    return value
  }
  throw new Error(`Not a valid ethereum public key:${value}.`)
}

export function toEthereumPrivateKey(value: string): EthereumPrivateKey {
  if (isValidEthereumPrivateKey(value)) {
    return value
  }
  throw new Error(`Not a valid ethereum private key:${value}.`)
}

export function toEthereumSignature(value: ECDSASignature): EthereumSignature {
  if (isValidEthereumSignature(value)) {
    return value
  }
  throw new Error(`Not a valid ethereum signature:${value}.`)
}
