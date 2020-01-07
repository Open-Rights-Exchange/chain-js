import * as ecc from 'eosjs-ecc'
import { EncryptedDataString } from '../../../crypto'

enum EosPublicKeyBrand {
  _ = '',
}
enum EosPrivateKeyBrand {
  _ = '',
}
enum EosSignatureBrand {
  _ = '',
}

export type EosPublicKey = string & EosPublicKeyBrand
export type EosPrivateKey = string & EosPrivateKeyBrand
export type EosSignature = string & EosSignatureBrand

export type KeyPair = {
  public: EosPublicKey
  private: EosPrivateKey
}

export type KeyPairEncrypted = {
  public: EosPublicKey
  privateEncrypted: EncryptedDataString
}

export type AccountKeysStruct = {
  publicKeys: {
    owner: EosPublicKey
    active: EosPublicKey
  }
  privateKeys: {
    owner: EosPrivateKey | EncryptedDataString
    active: EosPrivateKey | EncryptedDataString
  }
}

export function isValidEosPublicKey(value: EosPublicKey | string): value is EosPublicKey {
  const publicKeyprefix = 'EOS'
  return ecc.isValidPublic(value, publicKeyprefix)
}

export function isValidEosPrivateKey(value: EosPrivateKey | string): value is EosPrivateKey {
  return ecc.isValidPrivate(value)
}

export function isValidEosSignature(value: EosSignature | string): value is EosSignature {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
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
