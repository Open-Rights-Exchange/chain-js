import { toBuffer } from 'ethereumjs-util'

export function toEthBuffer(data: string | Buffer): Buffer {
  return toBuffer(data)
}

export function isLengthOne(array: any[]) {
  return array.length === 1
}
