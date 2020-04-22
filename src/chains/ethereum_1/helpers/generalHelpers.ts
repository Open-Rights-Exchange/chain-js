import { toBuffer } from 'ethereumjs-util'
import { HEX_PREFIX } from '../../../constants'

/** Attempts to transform a value to a standard Buffer class */
export function toEthBuffer(data: string | Buffer | number): Buffer {
  return toBuffer(data)
}

/** Whether array is exactly length of 1 */
export function isArrayLengthOne(array: any[]) {
  if (!array) return false
  return array.length === 1
}

/** Checks that string starts with 0x - appends if not */
export function ensureHexPrefix(key: string) {
  return key.startsWith(HEX_PREFIX) ? key : `${HEX_PREFIX}${key}`
}
