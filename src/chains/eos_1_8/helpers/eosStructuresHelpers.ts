import { EosPermissionStruct } from '../models'
import { isNullOrEmpty } from '../../../helpers'

export function isEosPermissionStruct(object: any): object is EosPermissionStruct {
  if (isNullOrEmpty(object)) return false
  return 'perm_name' in object
}
