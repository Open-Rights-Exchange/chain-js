import moment from 'moment'
import { EosDate, EosAsset, EosEntityName } from '../models/generalModels'

export function isValidEosDate(str: string): str is EosDate {
  return str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{2}\d+$/i) !== null
}
// A string representation of an EOSIO symbol, composed of a float with a precision of 4
// ... and a symbol composed of capital letters between 1-7 letters separated by a space
// example '1.0000 ABC'
export function isValidEosAsset(str: EosAsset | string): str is EosAsset {
  return str.match(/^\d{1,}\.\d{4} [A-Z]{3}$/) !== null
}

export function isValidEosEntityName(str: EosEntityName | string): str is EosEntityName {
  return str.match(/(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/i) !== null
}

export function toEosDate(date: Date | moment.Moment | EosDate): EosDate {
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
  throw new Error(`Should not get here. (invalid toDateStr provided): ${date}`)
}

export function toEosAsset(amount: number, symbol: string): EosAsset {
  if (symbol.length !== 3) throw new Error('symbol must be 3 characters long')
  const value = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4 }).format(amount)
  const asset = `${value} ${symbol.toUpperCase()}`
  // Note: the check below allows Typescript to confirm that asset can be of type EosAsset
  // If we dont call isValidEosAsset then Typescript shows an error
  if (isValidEosAsset(asset)) {
    return asset
  }
  throw new Error(`Should not get here. toEosAsset amount:${amount} symbol:${symbol}`)
}

export function toEosEntityName(name: string): EosEntityName {
  if (isValidEosEntityName(name)) {
    return name
  }
  const rules = 'Up to 13 characters, last character can\'t be ".", 13th character can only be [1-5] or [a-j].'
  throw new Error(`Not a valid EOS Account name:${name}. ${rules}`)
}
