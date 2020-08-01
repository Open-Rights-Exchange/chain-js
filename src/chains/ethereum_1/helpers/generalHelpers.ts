import BigNumber from 'bignumber.js'
import { toBuffer, BN } from 'ethereumjs-util'
import { HEX_PREFIX, DEFAULT_TOKEN_PRECISION } from '../ethConstants'
import { isANumber, getDecimalPlaces, isNullOrEmpty } from '../../../helpers'

/** Attempts to transform a value to a standard Buffer class */
export function toEthBuffer(data: string | Buffer | number): Buffer {
  return toBuffer(data)
}

/** object is of type BN (big number) */
export function isABN(value: any) {
  return BN.isBN(value)
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
 *  default is base 10 (string value is a decimal number) */
export function toBigIntegerString(value: string | number | BN, base: number = 10): string {
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
  const result = new BigNumber(useValue, base)
  return result.toFixed() // no exponential notation
}

/** Attempts to infer the precision of a token (eg ERC20) by counting digits after the decimal places in a number value string
 *  e.g. '0.120' = 3  - If no decimal places in the string, then returns default precision for token i.e. 0
 */
export function inferTokenPrecisionFromValue(value: string): number {
  let decmialPlaces = getDecimalPlaces(value)
  if (decmialPlaces === 0) {
    decmialPlaces = DEFAULT_TOKEN_PRECISION
  }
  return decmialPlaces
}

/** Convert a value with decimal places to a large integer string
 *  shift decimal places left by precision specified - e.g. (precision=18) ‘200.3333’ -> '200333300000000000000'
 *  base: default is base 10 (string value is a decimal number)
 *  if no precision is provided, infers precision by number of digits after decimal e.g. ‘200.3300’ = 4
 */
export function toTokenValueString(value: string, base: number = 10, precision: number): string {
  let usePrecision = precision
  if (isNullOrEmpty(precision)) {
    usePrecision = inferTokenPrecisionFromValue(value)
  }

  // Using BigNumber library here because it supports decmials
  const bigNumber = new BigNumber(value, base)
  const result = bigNumber.shiftedBy(usePrecision)
  return result.toFixed() // no exponential notation
}

/** Convert a value shifted to have no decimal places back to include decimal places
 *  shift decimal places right by precision specified - e.g. (precision=18) '200333300000000000000' -> ‘200.3333’
 *  base: default is base 10 (string value is a decimal number)
 *  if no precision is provided, it CANT be infered from the value - so we use DEFAULT_TOKEN_PRECISION (i.e. 0)
 */
export function fromTokenValueString(value: string, base: number = 10, precision: number): string {
  let negativePrecision
  // shift decimal places to the left (negative precision value)
  if (precision) {
    negativePrecision = -1 * precision
  }
  return toTokenValueString(value, base, negativePrecision)
}
