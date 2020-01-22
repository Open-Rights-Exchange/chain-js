import { EosEntityName, EosPermissionSimplified } from './generalModels'
import { EosPublicKey } from './cryptoModels'

export type LinkPermissionsParams = {
  permissionName: EosEntityName
  contract: EosEntityName
  action: string
}

export type DeletePermissionsParams = {
  accountName: EosEntityName
  permissionName: EosEntityName
}

export type ReplacePermissionKeysParams = {
  permissionName: EosEntityName
  parentPermissionName: EosEntityName
  publicKeys: EosPublicKey[]
  accountPermissions: EosPermissionSimplified[]
  accountName: EosEntityName
}

export type UnlinkPermissionsParams = {
  permissionName: EosEntityName
  contract: EosEntityName
  action: string
}
