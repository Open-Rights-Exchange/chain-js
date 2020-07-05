import { isValidAddress } from 'algosdk'
import { isNullOrEmpty } from '../../../helpers'
import { AlgorandAddress, AlgorandSymbol } from '../models'

/** A string - assumption is that it follows Algorand asset symbol convention */
export function isValidAlgorandSymbol(str: AlgorandSymbol | string): str is AlgorandSymbol {
  if (isNullOrEmpty(str)) return false
  return true
}

/** Construct a valid algorand symbol */
export function toAlgorandSymbol(symbol: string): AlgorandSymbol {
  if (isValidAlgorandSymbol(symbol)) {
    return symbol
  }
  throw new Error(`Not a valid Algorand symbol:${symbol}`)
}

export function isValidAlgorandAddress(address: string): boolean {
  return isValidAddress(address)
}

/** Converts a string to an AlgorandAddress (throws if cant be converted to a valid address) */
export function toAlgorandAddress(value: string): AlgorandAddress {
  if (isValidAlgorandAddress(value)) {
    return value
  }
  if (value === '') {
    return null
  }
  throw new Error(`Not a valid Algorand Account:${value}.`)
}
