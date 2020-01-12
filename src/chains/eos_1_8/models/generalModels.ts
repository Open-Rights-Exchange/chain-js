import { EosPublicKey, EosAccountKeysStruct } from './cryptoModels'
import { ChainAssetBrand, ChainDateBrand, ChainEntityNameBrand, KeyPairEncrypted } from '../../../models'

// using Enum 'brands' to force a string type to have a particular format
// See - https://spin.atomicobject.com/2017/06/19/strongly-typed-date-string-typescript/
// ... and https://basarat.gitbooks.io/typescript/docs/tips/nominalTyping.html

// EOS Account name has no more than 13 characters
// Last character can't be '.'
// 13th character can only be [1-5] or [a-j]
export type EosEntityName = string & ChainEntityNameBrand
export type EosDate = string & ChainDateBrand // Datetime string in the format YYYY-MM-DDTHH:MM:SS.sss
export type EosAsset = string & ChainAssetBrand

/** A simple container for account, permission, and public key */
export type Authorization = {
  account: EosEntityName
  permission: EosEntityName
  publicKey?: EosPublicKey
}

export type EosPermissionSimplified = {
  name: EosEntityName
  parent: EosEntityName
  publicKey: EosPublicKey
  publicKeyWeight: number
  threshold: number
}

export type GeneratedKeys = {
  accountKeys: EosAccountKeysStruct
  permissionKeys: GeneratedPermissionKeys[]
}

export type GeneratedPermissionKeys = {
  permissionName: EosEntityName
  keyPair: KeyPairEncrypted
}

export type GenerateMissingKeysParams = {
  newKeysPassword?: string
  newKeysSalt?: string
}
