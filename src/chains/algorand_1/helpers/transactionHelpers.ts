import { AlgorandUnit } from '../models'

/** Algorand supports only 2 units: algo and microalgo */
export function toMicroAlgo(amount: number, type: AlgorandUnit) {
  if (type === AlgorandUnit.Algo) {
    return amount * 100000
  }
  return amount
}
