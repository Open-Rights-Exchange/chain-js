import moment from 'moment'
import { BN } from 'ethereumjs-util'
import { EthereumDate, EthereumEntityName, EthereumAsset, EthereumSymbol } from '../models/generalModels'
import { isNullOrEmpty, isInEnum } from '../../../helpers'
import { toWei } from './transactionHelpers'
import {
  toEthUnit,
  isValidEthereumAddress,
  isValidEthereumPublicKey,
  isValidEthereumTxData,
  isValidEthereumPrivateKey,
} from './cryptoModelHelpers'
import { EthUnit } from '../models'

export function isValidEthereumDateString(str: string): str is EthereumDate {
  if (isNullOrEmpty(str)) return false
  return str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{2}\d+$/i) !== null
}

export function isValidEthereumUnit(unit: string): boolean {
  return isInEnum(EthUnit, unit)
}

export function isValidEthereumAsset(value: number | BN, unit: string = 'wei'): boolean {
  if (value > 0 && isValidEthereumUnit(unit)) return true
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

/** A string - assumption is that it follows ERC20 naming convention */
export function isValidEthereumSymbol(str: EthereumSymbol | string): str is EthereumSymbol {
  if (isNullOrEmpty(str)) return false
  return true
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

export function toEthereumAsset(amount: number, unit: string): EthereumAsset {
  if (isValidEthereumAsset(amount, unit)) throw new Error('Symbol must be ethereum unit type')
  return toWei(amount, toEthUnit(unit)) as EthereumAsset
}

export function toEthereumEntityName(name: string): EthereumEntityName {
  if (isValidEthereumEntityName(name)) {
    return name
  }

  if (isNullOrEmpty(name)) {
    return null
  }

  throw new Error(
    `Not a valid Ethereum entity :${name}. Ethereum entity can valid address, public key, private key or transaction data.`,
  )
}

/** Construct a valid Ethereum symbol */
export function toEthereumSymbol(symbol: string): EthereumSymbol {
  if (isValidEthereumSymbol(symbol)) {
    return symbol
  }
  throw new Error(`Not a valid Ethereum symbol:${symbol}`)
}
