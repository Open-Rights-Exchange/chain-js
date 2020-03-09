import ethUtil from 'ethereumjs-util'

export function toEthBuffer(data: string | Buffer): Buffer {
  return ethUtil.toBuffer(data)
}

export function isLengthOne(array: any[]) {
  return array.length === 1
}
