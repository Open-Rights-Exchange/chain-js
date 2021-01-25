import { EosEntityName, EosPermission } from './generalModels'
import { EosPublicKey } from './cryptoModels'

export type LinkPermissionsParams = {
  permissionName: EosEntityName
  contract: EosEntityName | string
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
  accountPermissions: EosPermission[]
  accountName: EosEntityName
}

export type UnlinkPermissionsParams = {
  contract: EosEntityName | string
  action: string
}
