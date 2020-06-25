import { toBuffer, BN } from 'ethereumjs-util'
import { HEX_PREFIX } from '../ethConstants'

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

/** convert a balance and decimals into a long value string */
export function bigNumberToString(value: BN, decimals: number) {
  const bigValue = new BN(value)
  const decimalsBN = new BN(decimals)
  const divisor = new BN(10).pow(decimalsBN)
  return `${bigValue.div(divisor)}.${bigValue.mod(divisor)}`
}
