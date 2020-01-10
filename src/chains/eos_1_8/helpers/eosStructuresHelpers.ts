import { EosPermissionStruct } from '../models'

export function isEosPermissionStruct(object: any): object is EosPermissionStruct {
  return 'perm_name' in object
}
