import { isNullOrEmpty } from '../../../helpers'
import { AlgorandSymbol } from '../models/generalModels'

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
