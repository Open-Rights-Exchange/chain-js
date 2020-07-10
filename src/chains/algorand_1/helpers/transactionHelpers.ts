import { AlgorandUnit } from '../models'

/** Convert amount from fromType to microAlgo */
export function toMicroAlgo(amount: string, fromType: AlgorandUnit) {
  const value = parseFloat(amount)
  if (fromType === AlgorandUnit.Algo) {
    return (value * 100000).toString()
  }
  if (fromType === AlgorandUnit.Microalgo) {
    return amount
  }
  throw new Error(`Not a supported Algorand type: ${fromType}`)
}
