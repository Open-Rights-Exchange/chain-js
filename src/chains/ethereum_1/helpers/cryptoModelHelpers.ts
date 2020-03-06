import { EthereumPublicKey, EthereumPrivateKey } from '../models/cryptoModels'
// eslint-disable-next-line import/no-cycle
import { isValidPrivateKey, isValidPublicKey } from '../ethCrypto'

export function isValidEthereumPublicKey(value: any): value is EthereumPublicKey {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  return isValidPublicKey(value)
}
export function isValidEthereumPrivateKey(value: any): value is EthereumPrivateKey {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  return isValidPrivateKey(value)
}
export function toEthereumPublicKey(value: string): EthereumPublicKey {
  if (isValidEthereumPublicKey(value)) {
    return value
  }
  throw new Error(`Not a valid ETH public key:${value}.`)
}

export function toEthereumPrivateKey(value: string): EthereumPrivateKey {
  if (isValidEthereumPrivateKey(value)) {
    return value
  }
  throw new Error(`Not a valid ETH private key:${value}.`)
}
