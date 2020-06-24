import { AlgorandUnit } from '../models/generalModels'

/** Algorand supports only 2 units: algo and microalgo */
export function toAlgo(amount: number, type: AlgorandUnit) {
  if (type === AlgorandUnit.Microalgo) {
    return amount / 100000
  }
  return amount
}
