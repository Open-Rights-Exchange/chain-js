import moment from 'moment'
import { EosDate, EosAsset, EosEntityName, EosSymbol } from '../models/generalModels'
import { isNullOrEmpty } from '../../../helpers'

/**  Expects a format of time_point/time_point_sec
 * Example here: https://eosio.stackexchange.com/questions/4830/can-we-store-date-on-eosio-table/4831
 * */
export function isValidEosDate(str: string): str is EosDate {
  if (isNullOrEmpty(str)) return false
  return str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{2}\d+$/i) !== null
}

// A string representation of an EOSIO symbol, composed of a float with a precision of 3-4
// ... and a symbol composed of capital letters between 1-7 letters separated by a space
// example '1.0000 ABC'
export function isValidEosAsset(str: EosAsset | string): str is EosAsset {
  if (isNullOrEmpty(str)) return false
  return str.match(/^\d{1,}\.?\d{0,4} [A-Z]{1,7}$/) !== null
}

/** Expects a string composed of up to 7 upper-case letters */
export function isValidEosSymbol(str: EosSymbol | string): str is EosSymbol {
  if (isNullOrEmpty(str)) return false
  return str.match(/^[A-Z]{1,7}$/) !== null
}

export function isValidEosEntityName(str: EosEntityName | string): str is EosEntityName {
  if (isNullOrEmpty(str)) return false
  return str.match(/(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/i) !== null
}

export function toEosDate(date: string | Date | moment.Moment | EosDate): EosDate {
  if (typeof date === 'string') {
    if (isValidEosDate(date)) {
      return date
    }
    throw new Error(`Invalid date string: ${date}`)
  } else {
    const dateString = moment(date).format('YYYY-MM-DDTHH:MM:SS.sss')
    if (isValidEosDate(dateString)) {
      return dateString
    }
  }
  throw new Error(`Invalid toEosDate provided: ${date}`)
}

/** Construct a well-formatted EOS Asset string
 *  amount is a string that must contain the number of precision digits that the token was created with
 *  e.g. '1.0000 EOS' for EOS (4 digits of precision) or '1.00 MYSM' for a token created with 2 decimals of precision */
export function toEosAsset(amount: string, symbol: string): EosAsset {
  if (symbol.length < 1 || symbol.length > 7) throw new Error('symbol must be 1 or 7 characters long')
  // const value = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, useGrouping: false }).format(amount)
  const asset = `${amount} ${symbol.toUpperCase()}`
  // Note: the check below allows Typescript to confirm that asset can be of type EosAsset
  // If we dont call isValidEosAsset then Typescript shows an error
  if (isValidEosAsset(asset)) {
    return asset
  }
  throw new Error(`toEosAsset failed - amount:${amount} symbol:${symbol}`)
}

/** Construct a valid EOS Symbol - e.g. 'EOS' */
export function toEosSymbol(symbol: string = ''): EosSymbol {
  if (isValidEosSymbol(symbol)) {
    return symbol
  }
  throw new Error('Symbol must be between 1 and 7 upper-case letters')
}

export function toEosEntityName(name: string): EosEntityName {
  if (isValidEosEntityName(name)) {
    return name
  }

  if (name === '') {
    return null
  }

  const rules = 'Up to 13 characters, last character can\'t be ".", 13th character can only be [1-5] or [a-j].'
  throw new Error(`Not a valid EOS Account name:${name}. ${rules}`)
}

/**
 * Returns a valid eosEntityName or null (Useful when the name can be null)
 */
export function toEosEntityNameOrNull(name: string): EosEntityName {
  if (name === null || name === undefined) return null

  return toEosEntityName(name)
}

/**
 * Returns a valid eosEntityName or empty string (Useful when eos transactions accepts empty string)
 */
export function toEosEntityNameOrEmptyString(name: string): EosEntityName | '' {
  if (name === '') return ''

  return toEosEntityName(name)
}
/** Create or decompose an EosAsset
 *  Provide either qty and symbol OR a fully formed string (e.g. '1.000 EOS') */
export class EosAssetHelper {
  private _amount: string

  private _symbol: EosSymbol

  private _asset: EosAsset

  constructor(amount?: string, symbol?: string, assetString?: string) {
    if (assetString) {
      this._asset = this.toEosAssetFromString(assetString)
    } else {
      if (!amount || !symbol) {
        throw new Error('Missing parameters: provide either number and symbol OR assetString')
      }
      this._asset = toEosAsset(amount, symbol)
      this._amount = amount
      this._symbol = toEosSymbol(symbol)
    }
  }

  get asset() {
    return this._asset
  }

  get amount() {
    return this._amount
  }

  /** The options provided when the transaction class was created */
  get symbol() {
    return this._symbol
  }

  /** Convert a string with a number and symbol into a well-formed EOS asset string - if possible */
  toEosAssetFromString(assetString: string = ''): EosAsset {
    const [amount, symbol] = assetString.split(' ')
    if (amount && symbol) {
      this._asset = toEosAsset(amount, symbol)
      this._amount = amount
      this._symbol = toEosSymbol(symbol)
      return
    }
    throw new Error('Cant parse assetString. Should contain a number and symbol')
  }
}
