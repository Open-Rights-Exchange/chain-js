import * as ecc from 'eosjs-ecc'
import { EosPrivateKey, EosPublicKey, EosSignature } from '../models'
import { isNullOrEmpty } from '../../../helpers'

export function isValidEosPublicKey(value: EosPublicKey | string): value is EosPublicKey {
  if (isNullOrEmpty(value)) return false
  const publicKeyprefix = 'EOS'
  return ecc.isValidPublic(value, publicKeyprefix)
}

export function isValidEosPrivateKey(value: EosPrivateKey | string): value is EosPrivateKey {
  if (isNullOrEmpty(value)) return false
  return ecc.isValidPrivate(value)
}

export function isValidEosSignature(value: EosSignature | string): value is EosSignature {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  if (isNullOrEmpty(value)) return false
  return value.startsWith('SIG_K1')
}

export function toEosPublicKey(value: string): EosPublicKey {
  if (isValidEosPublicKey(value)) {
    return value
  }
  throw new Error(`Not a valid EOS public key:${value}.`)
}

export function toEosPrivateKey(value: string): EosPrivateKey {
  if (isValidEosPrivateKey(value)) {
    return value
  }
  throw new Error(`Not a valid EOS private key:${value}.`)
}

export function toEosSignature(value: string): EosSignature {
  if (isValidEosSignature(value)) {
    return value
  }
  throw new Error(`Not a valid EOS signature:${value}.`)
}
