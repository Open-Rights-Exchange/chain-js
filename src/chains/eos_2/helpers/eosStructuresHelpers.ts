import { hexToUint8Array } from 'eosjs/dist/eosjs-serialize'
import { EosActionStruct, EosPermissionStruct, EosRawTransaction, EosSerializedTransaction } from '../models'
import {
  isAnObject,
  isArrayLengthOne,
  isAString,
  isAUint8Array,
  isHexString,
  isNullOrEmpty,
  jsonParseAndRevive,
} from '../../../helpers'
import { throwNewError } from '../../../errors'

export function isEosPermissionStruct(object: any): object is EosPermissionStruct {
  if (isNullOrEmpty(object)) return false
  return 'perm_name' in object
}

/** Accepts either an object where each value is the uint8 array value
 *     ex: {'0': 24, ... '3': 93 } => [24,241,213,93]
 *  OR a packed transaction as a string of hex bytes
 * */
export function ensureSerializedIsRaw(serializedTransaction: EosSerializedTransaction): EosRawTransaction {
  if (isAUint8Array(serializedTransaction)) return serializedTransaction as Uint8Array
  // if the trasaction data is a JSON array of bytes, convert to Uint8Array
  if (isAnObject(serializedTransaction)) {
    const trxLength = Object.keys(serializedTransaction).length
    let buf = new Uint8Array(trxLength)
    buf = Object.values(serializedTransaction) as any // should be a Uint8Array in this value
    return buf
  }
  // if transaction is a packed transaction (string of bytes), convert it into an Uint8Array of bytes
  if (serializedTransaction && isAString(serializedTransaction)) {
    const rawifiedTransaction = hexToUint8Array(serializedTransaction as string)
    return rawifiedTransaction
  }
  throw Error('Missing or malformed serializedTransaction (ensureSerializedIsRaw)')
}

export function isEosActionStructArray(value: any) {
  if (isNullOrEmpty(value) || !Array.isArray(value)) return false
  if (!(value[0] as EosActionStruct)?.account) return false
  return true
}

export function isSerializedEosTransaction(value: any) {
  if (isNullOrEmpty(value)) return false
  // In case we have a Uint8Array in JSON format
  const serializedTrx = jsonParseAndRevive(JSON.stringify(value))
  if (isAUint8Array(serializedTrx) || isHexString(serializedTrx)) {
    if (!isArrayLengthOne(value)) {
      throwNewError('For setting action as serializedTransaction the input array length has to be one.')
    }
    return true
  }
  return false
}
