import { isValidAddress } from 'algosdk'
import * as base32 from 'hi-base32'
import { isNullOrEmpty, byteArrayToHexString } from '../../../helpers'
import { AlgorandAddress, AlgorandSymbol, AlgorandAddressStruct } from '../models'
import { toAddressFromPublicKey, toAlgorandPublicKey } from './cryptoModelHelpers'
import { ALGORAND_ADDRESS_BYTES_ONLY_LENGTH, ALGORAND_CHECKSUM_BYTE_LENGTH, PUBLIC_KEY_LENGTH } from '../algoConstants'

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

// converts an address (encoded as a hex string) to a Uint8Array array (needed by the chain)
export function toAlgorandAddressFromRaw(rawAddress: AlgorandAddressStruct): AlgorandAddress {
  if (isNullOrEmpty(rawAddress)) return null
  return toAddressFromPublicKey(toAlgorandPublicKey(byteArrayToHexString(rawAddress.publicKey)))
}

/** converts an address (encoded as a Uint8Array array) to a hex string  */
// NOTE: copied most of this code from algosdk - address.decode
export function toRawAddressFromAlgoAddr(address: AlgorandAddress): AlgorandAddressStruct {
  if (isNullOrEmpty(address)) return null
  const decoded = base32.decode.asBytes(address)
  const publicKey: Uint8Array = new Uint8Array(
    decoded.slice(0, ALGORAND_ADDRESS_BYTES_ONLY_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH),
  )
  const checksum: Uint8Array = new Uint8Array(decoded.slice(PUBLIC_KEY_LENGTH, ALGORAND_ADDRESS_BYTES_ONLY_LENGTH))
  return {
    publicKey,
    checksum,
  }
}
