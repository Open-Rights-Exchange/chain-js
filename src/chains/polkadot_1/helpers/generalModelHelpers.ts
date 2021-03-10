import { isNullOrEmpty } from '../../../helpers'
import { PolkadotAddress } from '../models'
import { isValidPolkadotAddress } from './cryptoModelHelpers'

export function toPolkadotEntityName(name: string): PolkadotAddress {
  if (isValidPolkadotAddress(name)) {
    return name
  }

  if (isNullOrEmpty(name)) {
    return null
  }

  throw new Error(
    `Not a valid Ethereum entity :${name}. Ethereum entity can valid address, public key, private key or transaction data.`,
  )
}

// TODO - use other generalModelHelpers.ts as starting point for this file
