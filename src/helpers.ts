import { parse, stringify } from 'flatted'
import { TRANSACTION_ENCODING } from './constants'
import { ChainEntityName, IndexedObject, ChainEndpoint } from './models'

export function isNullOrEmpty(obj: any): boolean {
  if (obj === undefined) {
    return true
  }
  if (obj === null) {
    return true
  }
  // Check for an empty array too
  // eslint-disable-next-line no-prototype-builtins
  if (obj.hasOwnProperty('length')) {
    if (obj.length === 0) {
      return true
    }
  }
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

export function getArrayIndexOrNull(array: any[] = [], index: number) {
  if (array.length > index && !isNullOrEmpty(array[index])) {
    return array[index]
  }
  return null
}

// uses flatted library to allow stringifing on an object with circular references
// NOTE: This does not produce output similar to JSON.stringify, it has it's own format
// to allow you to stringify and parse and get back an object with circular references
export function stringifySafe(obj: any): any {
  return stringify(obj)
}

// this is the inverse of stringifySafe
// if converts a specially stringifyied string (created by stringifySafe) back into an object
export function parseSafe(string: string): any {
  return parse(string)
}

// it converts the input data with the optionalspecified encoding  into a buffer object
export function toBuffer(data: any, encoding: BufferEncoding = TRANSACTION_ENCODING) {
  return Buffer.from(data, encoding)
}

/** filter values in array down to an array of a single, uniques value
 * e.g. if array = [{value:'A', other}, {value:'B'}, {value:'A', other}]
 * distinct(array, uniqueKey:'value') => ['A','B']
 */
export function distinctValues(values: Array<any>, uniqueKey: string) {
  return [...new Set(values.map(item => item[uniqueKey]))]
}

/** combine one array into another but only include unique values */
export function addUniqueToArray<T>(array: T[], values: T[]) {
  const arrayFixed = array ?? []
  const valuesFixed = values ?? []
  const set = new Set<T>([...arrayFixed, ...valuesFixed])
  return [...set]
}

export function isAString(value: any) {
  if (!value) {
    return false
  }
  return typeof value === 'string' || value instanceof String
}

export function isADate(value: any) {
  return value instanceof Date
}

export function isABoolean(value: any) {
  return typeof value === 'boolean' || value instanceof Boolean
}

export function isANumber(value: any) {
  if (Number.isNaN(value)) return false
  return typeof value === 'number' || value instanceof Number
}

export function isAnObject(obj: any) {
  return obj !== null && typeof obj === 'object'
}

/** Typescript Typeguard to verify that the value is in the enumType specified  */
export function isInEnum<T>(enumType: T, value: any): value is T[keyof T] {
  return Object.values(enumType).includes(value as T[keyof T])
}

export function getUniqueValues<T>(array: T[]) {
  return Array.from(new Set(array.map(item => JSON.stringify(item)))).map(item => JSON.parse(item))
}

export function trimTrailingChars(value: string, charToTrim: string) {
  if (isNullOrEmpty(value) || !isAString(value)) return value
  const regExp = new RegExp(`${charToTrim}+$`)
  return value.replace(regExp, '')
}

export const removeEmptyValuesInJsonObject = (obj: { [x: string]: any }) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') removeEmptyValuesInJsonObject(obj[key])
    // recurse
    // eslint-disable-next-line no-param-reassign
    else if (isNullOrEmpty(obj[key])) delete obj[key] // delete the property
  })
}

export const notImplemented = () => {
  throw new Error('Not Implemented')
}

export const notSupported = () => {
  throw new Error('Not Supported')
}

/**
 * Returns an the first value from the array if only 1 exists, otherwise returns null
 */
export function getFirstValueIfOnlyOneExists(array: any[]): any {
  const lengthRequirement = 1
  if (!isNullOrEmpty(array) && array.length === lengthRequirement) {
    const [firstValue] = array
    return firstValue
  }

  return null
}

/** Always returns true (unless empty */
export function isValidChainEntityName(str: ChainEntityName | string): str is ChainEntityName {
  if (isNullOrEmpty(str)) return false
  return true
}

/** Coerce string into ChainEntityName */
export function toChainEntityName(name: string): ChainEntityName {
  if (name === '') {
    return null
  }
  if (isValidChainEntityName(name)) {
    return name
  }
  throw new Error(`Should not get here. toChainEntityName name:${name}`)
}

/* Provides a wrapper around a fetch object to allow injection of options into each fetch request
   Returns fetch reponse */
export function fetchWrapper(fetchService: any, globalOptions = {}) {
  // standard fetch interface so that this can be plugged-into any code that accepts a fetch object type
  return async function fetch(url: any, options = {}): Promise<any> {
    const fetchOptions = { ...globalOptions, ...options }
    const response = await fetchService(url, fetchOptions)
    return response
  }
}

/** Conver an array to a JSON object e.g. [{'key1':value1}, {'key2':value2}] =>  {{'key1':value1}, {'key2':value2}} */
export function arrayToObject(array: IndexedObject[]) {
  const result: any = {}
  if (isNullOrEmpty(array)) return null
  array.forEach(header => {
    const key = Object.keys(header)[0]
    result[key] = header[key]
  })
  return result
}

/** returns the required header from the headers attached to chain endpoint. For ex: headers: [{'X-API-Key': '...'}]  */
export function getHeaderValueFromEndpoint(endpoint: ChainEndpoint, key: string) {
  const { headers } = endpoint?.options
  const header = headers.find((val: {}) => Object.keys(val).includes(key))
  return header
}

/** returns the number of decimal places in a number (expressed as a string) - supports exponential notiation
 *  e.g. '.05' = 2, '25e-100'= 100. '2.5e-99' = 100 */
export function getDecimalPlaces(num = '') {
  const match = num.match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
  if (!match) {
    return 0
  }

  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) -
      // Adjust for scientific notation.
      (match[2] ? +match[2] : 0),
  )
}
