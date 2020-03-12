import { toBuffer } from 'ethereumjs-util'

export function toEthBuffer(data: string | Buffer | number): Buffer {
  return toBuffer(data)
}

export function isLengthOne(array: any[]) {
  return array.length === 1
}

export function addPrefixToKey(key: string) {
  return key.startsWith('0x') ? key : `0x${key}`
}
