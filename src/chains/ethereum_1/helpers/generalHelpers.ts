import { toBuffer } from 'ethereumjs-util'
import { HEX_PREFIX } from '../../../constants'

export function toEthBuffer(data: string | Buffer | number): Buffer {
  return toBuffer(data)
}

export function isArrayLengthOne(array: any[]) {
  if (!array) return false
  return array.length === 1
}

export function addPrefixToHex(key: string) {
  return key.startsWith(HEX_PREFIX) ? key : `${HEX_PREFIX}${key}`
}
