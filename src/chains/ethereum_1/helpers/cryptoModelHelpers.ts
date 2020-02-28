import { isValidSignature } from 'ethereumjs-util'
import { EthSignature } from '../models/cryptoModels'
import { isNullOrEmpty } from '../../../helpers'

export function isValidEthSignature(value: EthSignature): boolean {
  // this is an oversimplified check just to prevent assigning a wrong string
  // signatures are actually verified in transaction object
  const { v, r, s } = value
  if (isNullOrEmpty(v) || isNullOrEmpty(r) || isNullOrEmpty(s)) return false
  return isValidSignature(v, r, s)
}
