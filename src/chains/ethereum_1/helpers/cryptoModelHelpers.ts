import { ECDSASignature } from 'ethereumjs-util'
import { isValidPrivateKey, isValidPublicKey, isValidSignature } from '../ethCrypto'
import { EthSignature, EthPublicKey, EthPrivateKey } from '../models/cryptoModels'
import { isNullOrEmpty } from '../../../helpers'
import { toEthBuffer } from './generalHelpers'

export function isValidEthSignature(value: ECDSASignature | EthSignature): value is EthSignature {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  const { v, r, s } = value
  if (isNullOrEmpty(v) || isNullOrEmpty(r) || isNullOrEmpty(s)) return false
  return isValidSignature(v, r, s)
}
export function isValidEthPublicKey(value: string | EthPublicKey): value is EthPublicKey {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  return isValidPublicKey(value)
}
export function isValidEthPrivateKey(value: string | EthPrivateKey): value is EthPrivateKey {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  return isValidPrivateKey(value)
}

export function toEthPublicKey(value: string): EthPublicKey {
  if (isValidEthPublicKey(value)) {
    return value
  }
  throw new Error(`Not a valid ETH public key:${value}.`)
}

export function toEthPrivateKey(value: string): EthPrivateKey {
  if (isValidEthPrivateKey(value)) {
    return value
  }
  throw new Error(`Not a valid ETH private key:${value}.`)
}

export function toEthSignature(value: ECDSASignature): EthSignature {
  if (isValidEthSignature(value)) {
    return value
  }
  throw new Error(`Not a valid ETH signature:${value}.`)
}
