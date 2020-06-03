import { EosPublicKey, EosAccountKeys } from './cryptoModels'
import {
  ChainAssetBrand,
  ChainDateBrand,
  ChainEntityNameBrand,
  KeyPairEncrypted,
  ChainSymbolBrand,
} from '../../../models'

// using Enum 'brands' to force a string type to have a particular format
// See - https://spin.atomicobject.com/2017/06/19/strongly-typed-date-string-typescript/
// ... and https://basarat.gitbooks.io/typescript/docs/tips/nominalTyping.html

// EOS Account name has no more than 13 characters
// Last character can't be '.'
// 13th character can only be [1-5] or [a-j]
export type EosEntityName = string & ChainEntityNameBrand
export type EosDate = string & ChainDateBrand // Datetime string in the format YYYY-MM-DDTHH:MM:SS.sss
export type EosAsset = string & ChainAssetBrand
export type EosSymbol = string & ChainSymbolBrand

/** A simple container for account, permission, and public key */
export type EosAuthorization = {
  account: EosEntityName
  permission: EosEntityName
  publicKey?: EosPublicKey
}

/** Chain configuation for creating a new connection */
export type EosChainSettings = {
  createEscrowContract?: string
  communicationSettings?: EosChainSettingsCommunicationSettings
  defaultTransactionSettings?: {
    blocksBehind: number
    expireSeconds: number
  }
  fetch?: any
  monitorType?: EosChainMonitorType
  monitorUrl?: URL
  unusedAccountPublicKey?: string
}

/** Monitor services listenting to the chain */
export enum EosChainMonitorType {
  NONE,
  DFUSE,
  DEMUX,
}

export type EosChainSettingsCommunicationSettings = {
  blocksToCheck: number
  checkInterval: number
  getBlockAttempts: number
}

export type EosPermissionSimplified = {
  name: EosEntityName
  parent: EosEntityName
  publicKey: EosPublicKey
  publicKeyWeight?: number
  threshold?: number
}

export type EosGeneratedKeys = {
  accountKeys: EosAccountKeys
  permissionKeys: EosGeneratedPermissionKeys[]
}

export type EosGeneratedPermissionKeys = {
  permissionName: EosEntityName
  keyPair: KeyPairEncrypted
}

export type EosNewKeysOptions = {
  password?: string
  salt?: string
}

export type EosPermission = {
  name: EosEntityName
  parent: EosEntityName | ''
  firstPublicKey: EosPublicKey
  firstPublicKeyMeetsThreshold: boolean
  requiredAuth: EosRequiredAuthorization
}

/** EOS Data Structure for the Required Authorization for a permission - i.e. includes required accounts, permissions, and weights */
export type EosRequiredAuthorization = {
  threshold: number
  accounts: {
    permission: {
      actor: EosEntityName
      permission: EosEntityName
    }
    weight: number
  }[]
  keys: {
    key: EosPublicKey
    weight: number
  }[]
  waits: {
    waitSec: number
    weight: number
  }[]
}
