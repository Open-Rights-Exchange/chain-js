import { AlgorandUnit } from '../models'

/** Algorand supports only 2 units: algo and microalgo */
export function toAlgo(amount: number, type: AlgorandUnit) {
  if (type === AlgorandUnit.Microalgo) {
    return amount / 1000000
  }
  return amount
}

/** Convert amount from fromType to microAlgo */
export function toMicroAlgo(amount: string, fromType: AlgorandUnit): number {
  const value = parseFloat(amount)
  if (fromType === AlgorandUnit.Algo) {
    return value * 1000000
  }
  if (fromType === AlgorandUnit.Microalgo) {
    return value
  }
  throw new Error(`Not a supported Algorand type: ${fromType}`)
}
