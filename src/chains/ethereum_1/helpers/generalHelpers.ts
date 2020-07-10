import BigNumber from 'bignumber.js'
import { toBuffer, BN } from 'ethereumjs-util'
import { HEX_PREFIX } from '../ethConstants'
import { isANumber } from '../../../helpers'

/** Attempts to transform a value to a standard Buffer class */
export function toEthBuffer(data: string | Buffer | number): Buffer {
  return toBuffer(data)
}

/** object is of type BN (big number) */
export function isABN(value: any) {
  return BN.isBN(value)
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

/** convert a balance and decimals into a long value string
 *  e.g. BN('200333300000000000000'), precision=18 -> '200.333' */
export function bigNumberToString(value: BN, precision: number): string {
  const bigValue = new BN(value)
  const precisionBN = new BN(precision)
  const divisor = new BN(10).pow(precisionBN)
  return `${bigValue.div(divisor)}.${bigValue.mod(divisor)}`
}

/** Convert a string with decimal places, or number or BN to a large integer string
 *  default is base 10 (string value is a decimal number)
 *  e.g. (precision=18) ‘200.3333’ -> '200333300000000000000'
 */
export function toBigIntegerString(value: string | number | BN, base: number = 10, precision: number): string {
  let useValue: string | number
  // if we get a BN in, convert it to string so BigNumber can use it
  if (isABN(value)) {
    useValue = (value as BN).toString(10)
  } else if (isANumber(value)) {
    useValue = (value as number).toString(10)
  } else {
    useValue = value as string
  }
  // Using BigNumber library here because it supports decmials
  const bigNumber = new BigNumber(useValue, base)
  const result = bigNumber.shiftedBy(precision)
  return result.toFixed() // no exponential notation
}
