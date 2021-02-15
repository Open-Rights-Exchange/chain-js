import { PolkadotPublicKey } from "../models";
import { isNullOrEmpty } from "../../../helpers";
import { PolkadotAddress } from "../models";
import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'

export function isValidPolkadotPublicKey(value: PolkadotPublicKey): boolean {
  return true
}

export function isValidPolkadotAddress(address: PolkadotAddress): boolean {
  try {
    encodeAddress(
      isHex(address)
      ? hexToU8a(address)
      : decodeAddress(address)
    )

    return true
  } catch (error) {
    return false
  }
}

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