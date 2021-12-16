import { isValidAddress } from 'algosdk'
import * as base32 from 'hi-base32'
// import { isNullOrEmpty, byteArrayToHexString } from '../../../helpers'
import { Helpers } from '@open-rights-exchange/chainjs'

import {
  AlgorandAddress,
  AlgorandAddressStruct,
  AlgorandEntityName,
  AlgorandPublicKey,
  AlgorandSymbol,
} from '../models'
import { toAddressFromPublicKey, toAlgorandPublicKey } from './cryptoModelHelpers'
import { ALGORAND_ADDRESS_BYTES_ONLY_LENGTH, ALGORAND_CHECKSUM_BYTE_LENGTH, PUBLIC_KEY_LENGTH } from '../algoConstants'

/** A string - assumption is that it follows Algorand asset symbol convention */
export function isValidAlgorandSymbol(str: AlgorandSymbol | string): str is AlgorandSymbol {
  if (Helpers.isNullOrEmpty(str)) return false
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

export function toAlgorandEntityName(value: string): AlgorandEntityName {
  if (isValidAlgorandAddress(value)) {
    return value as AlgorandEntityName
  }
  if (value === '') {
    return null
  }
  throw new Error(`Not a valid Algorand Account:${value}.`)
}

/** Converts a publicKey (encoded as Uint8Array for chain) to an AlgorandAddres */
export function toAlgorandAddressFromPublicKeyByteArray(publicKeyBuffer: Uint8Array): AlgorandAddress {
  return toAddressFromPublicKey(toAlgorandPublicKey(Helpers.byteArrayToHexString(publicKeyBuffer)))
}

/** Determines AlgorandAddress from AlgorandAddressStruct (using embedded publicKey) */
export function toAlgorandAddressFromRawStruct(rawAddress: AlgorandAddressStruct): AlgorandAddress {
  if (Helpers.isNullOrEmpty(rawAddress)) return undefined
  return toAlgorandAddressFromPublicKeyByteArray(rawAddress.publicKey)
}

// NOTE: copied most of this code from algosdk - address.decode
/** converts an address (encoded as a Uint8Array array) to a hex string  */
export function toRawAddressFromAlgoAddr(address: AlgorandAddress): AlgorandAddressStruct {
  if (Helpers.isNullOrEmpty(address)) return null
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

/** Returns publicKey for associated address */
export function getPublicKeyForAddress(address: AlgorandAddress): AlgorandPublicKey {
  const rawAddress = toRawAddressFromAlgoAddr(address)
  return toAlgorandPublicKey(Helpers.byteArrayToHexString(rawAddress.publicKey))
}

/** Returns raw address for compressed transaction from address */
export function toRawAddressBufferFromAlgorandAddress(address: AlgorandAddress): Buffer {
  return Buffer.from(getPublicKeyForAddress(address))
}
