import moment from 'moment'
import { EthereumDate, EthereumEntityName, EthereumAsset } from '../models/generalModels'
import { isNullOrEmpty } from '../../../helpers'
import { toWei } from './transactionHelpers'
import {
  toEthUnit,
  isValidEthereumAddress,
  isValidEthereumPublicKey,
  isValidEthereumTxData,
  isValidEthereumPrivateKey,
} from './cryptoModelHelpers'

export function isValidEthereumDateString(str: string): str is EthereumDate {
  if (isNullOrEmpty(str)) return false
  return str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{2}\d+$/i) !== null
}

export function isValidEthereumAsset(symbol: string): boolean {
  if (
    symbol === 'noether' ||
    symbol === 'wei' ||
    symbol === 'kwei' ||
    symbol === 'Kwei' ||
    symbol === 'babbage' ||
    symbol === 'femtoether' ||
    symbol === 'mwei' ||
    symbol === 'Mwei' ||
    symbol === 'lovelace' ||
    symbol === 'picoether' ||
    symbol === 'gwei' ||
    symbol === 'Gwei' ||
    symbol === 'shannon' ||
    symbol === 'nanoether' ||
    symbol === 'nano' ||
    symbol === 'szabo' ||
    symbol === 'microether' ||
    symbol === 'micro' ||
    symbol === 'finney' ||
    symbol === 'milliether' ||
    symbol === 'milli' ||
    symbol === 'ether' ||
    symbol === 'kether' ||
    symbol === 'grand' ||
    symbol === 'mether' ||
    symbol === 'gether' ||
    symbol === 'tether'
  )
    return true
  return false
}

export function isValidEthereumEntityName(str: EthereumEntityName | string): str is EthereumEntityName {
  return !!(
    isValidEthereumAddress(str) ||
    isValidEthereumPublicKey(str) ||
    isValidEthereumTxData(str) ||
    isValidEthereumPrivateKey(str)
  )
}

export function toEthereumDate(date: string | Date | moment.Moment | EthereumDate): EthereumDate {
  if (typeof date === 'string') {
    if (isValidEthereumDateString(date)) {
      return date
    }
    throw new Error(`Invalid date string: ${date}`)
  } else {
    const dateString = moment(date).format('YYYY-MM-DDTHH:MM:SS.sss')
    if (isValidEthereumDateString(dateString)) {
      return dateString
    }
  }
  throw new Error(`Should not get here. (invalid toDateStr provided): ${date}`)
}

export function toEthereumAsset(amount: number, symbol: string): EthereumAsset {
  if (isValidEthereumAsset(symbol)) throw new Error('Symbol must be ethereum unit type')
  return toWei(amount, toEthUnit(symbol)) as EthereumAsset
}

export function toEthereumEntityName(name: string): EthereumEntityName {
  if (isValidEthereumEntityName(name)) {
    return name
  }

  if (name === '') {
    return null
  }

  throw new Error(
    `Not a valid Ethereum entity :${name}. Ethereum entity can valid address, public key, private key or transaction data.`,
  )
}
