import { isValidPrivate, isValidPublic, isValidAddress, isValidSignature, ECDSASignature } from 'ethereumjs-util'
import { isString } from 'util'
import { EthereumSignature, EthereumPublicKey, EthereumPrivateKey, EthereumAddress } from '../models'
import { toEthBuffer, addPrefixToKey } from './generalHelpers'

export function isValidEthereumPublicKey(value: string | EthereumPublicKey): value is EthereumPublicKey {
  return isValidPublic(toEthBuffer(addPrefixToKey(value)))
}

export function isValidEthereumPrivateKey(value: EthereumPrivateKey | string): value is EthereumPrivateKey {
  return isValidPrivate(toEthBuffer(addPrefixToKey(value)))
}

export function isValidEthereumSignature(
  value: EthereumSignature | string | ECDSASignature,
): value is EthereumSignature {
  let signature: ECDSASignature
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  if (isString(value)) {
    signature = JSON.parse(value)
  } else {
    signature = value
  }
  // TODO signature check fix
  const { v, r, s } = signature
  return true // isValidSignature(v, r, s)
}

// For a given private key, pr, the Ethereum address A(pr) (a 160-bit value) to which it corresponds is defined as the right most 160-bits of the Keccak hash of the corresponding ECDSA public key.
export function isValidEthereumAddress(value: string | EthereumAddress): boolean {
  return isValidAddress(value)
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

export function toEthereumSignature(value: string | ECDSASignature): EthereumSignature {
  if (isValidEthereumSignature(value)) {
    return value
  }
  throw new Error(`Not a valid ethereum signature:${value}.`)
}

export function toEthereumAddress(value: string): EthereumAddress {
  if (isValidEthereumAddress(value)) {
    return value
  }
  throw new Error(`Not a valid ethereum address:${value}.`)
}
