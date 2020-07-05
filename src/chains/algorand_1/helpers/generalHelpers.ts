import { AlgorandUnit } from '../models'

/** Whether array is exactly length of 1 */
export function isArrayLengthOne(array: any[]) {
  if (!array) return false
  return array.length === 1
}

/** Algorand supports only 2 units: algo and microalgo */
export function toAlgo(amount: number, type: AlgorandUnit) {
  if (type === AlgorandUnit.Microalgo) {
    return amount / 100000
  }
  return amount
}
