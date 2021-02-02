import * as algosdk from 'algosdk'
import { bufferToInt } from 'ethereumjs-util'
import { TextEncoder } from 'util'
import {
  bigIntToUint8Array,
  byteArrayToHexString,
  isAString,
  isAUint8Array,
  isHexString,
  isNullOrEmpty,
} from '../../../helpers'
import {
  AlgoClient,
  AlgorandMultiSigAccount,
  AlgorandMultiSigOptions,
  AlgorandRawTransactionMultisigStruct,
  AlgorandRawTransactionStruct,
  AlgorandTxSignResults,
} from '../models'

/** Calculates the multisig address using the multisig options including version, threshhold and addresses */
export function determineMultiSigAddress(multiSigOptions: AlgorandMultiSigOptions) {
  const mSigOptions = {
    version: multiSigOptions.version,
    threshold: multiSigOptions.threshold,
    addrs: multiSigOptions.addrs,
  }
  const multisigAddress: AlgorandMultiSigAccount = algosdk.multisigAddress(mSigOptions)
  return multisigAddress
}

/** Decode blob from SDK's sign transaction */
export function toRawTransactionFromSignResults(signResult: AlgorandTxSignResults) {
  let returnTx
  const { txID, blob } = signResult
  const transaction = algosdk.decodeObj(blob)
  if (transaction?.msig) {
    returnTx = transaction as AlgorandRawTransactionMultisigStruct
  } else {
    returnTx = transaction as AlgorandRawTransactionStruct
  }
  return { transactionId: txID, transaction: returnTx }
}
/** expects microAlgo in number format that AlgoSdk uses
 * returns algo in string format */
export function microToAlgoString(microAlgo: number): string {
  const algo = microAlgo / 1000000
  return algo.toString()
}

/** expects chainJs's standard native chain currency in string format
 * returns microAlgo in number format that AlgoSdk uses */
export function algoToMicro(algo: string): number {
  return parseFloat(algo) * 1000000
}

/** compile an uncompiled TEAL program (into a Uint8Array) */
export async function compileFromSourceCode(sourceCode: string, algoClient: AlgoClient): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const programBytes = encoder.encode(sourceCode)
  const compileResponse = await algoClient.compile(programBytes).do()
  return new Uint8Array(Buffer.from(compileResponse.result, 'base64'))
}

/** compile the TEAL program if needed */
export async function compileIfSourceCodeIfNeeded(
  program: string | Uint8Array,
  algoClient: AlgoClient,
): Promise<string> {
  if (!program) return undefined
  if (isHexString(program)) {
    return program as string
  }
  // compile the uncompiled program (into a hex string)
  const byteCode = await compileFromSourceCode(program as string, algoClient)
  return byteArrayToHexString(byteCode)
}

export function isBase64Encoded(value: string): boolean {
  return Buffer.from(value, 'base64').toString('base64') === value
}

/** AppArgs has two unencoded types => number & string
 *  Algosdk expects numbers as Uint8Arrays, string to be base64 encoded strings
 */
export function encodeAppArgIfHumanReadable(arg: string | number | Uint8Array): string | Uint8Array {
  if (!arg) return undefined
  if (isAUint8Array(arg)) return arg as Uint8Array
  if (isAString(arg)) {
    if (isBase64Encoded(arg as string)) return arg as string
    return Buffer.from(arg as string, 'utf-8').toString('base64')
  }
  return bigIntToUint8Array(arg as number)
}
/** AppArgs has two unencoded types => number & string
 *  Algosdk expects numbers as Uint8Arrays, string to be base64 encoded strings
 *  This function accepts appArgs in any format, makes sures each element is
 *    in number or unencoded string form
 */
export function encodedAppArgsToReadable(args: (string | Uint8Array | number)[]): (string | number)[] {
  const readable: (string | number)[] = args.map(arg => {
    if (isAUint8Array(arg)) return bufferToInt(Buffer.from(arg as Uint8Array)) as number
    if (isBase64Encoded(arg as string)) return Buffer.from(arg as string, 'base64').toString('utf-8') as string
    return arg as number | string
  })
  return readable
}

export function isAppArgsSdkEncoded(args: any[]): boolean {
  if (isNullOrEmpty(args)) return false
  return args.every(arg => isBase64Encoded(arg) || isAUint8Array(arg))
}
