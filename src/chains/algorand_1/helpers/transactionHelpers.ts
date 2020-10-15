import * as algosdk from 'algosdk'
import {
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
