import * as algosdk from 'algosdk'
import { toAlgorandAddressFromPublicKeyByteArray } from '../../../helpers'
import { isNullOrEmpty } from '../../../../../helpers'
import { AlgorandMultiSigAccount, AlgorandMultiSignatureMsigStruct } from '../../../models'
import { AlgorandMultisigNativeCreateAccountOptions } from './models'

/** Calculates the multisig address using the multisig options including version, threshhold and addresses */
export function determineMultiSigAddress(options: AlgorandMultisigNativeCreateAccountOptions): AlgorandMultiSigAccount {
  if (isNullOrEmpty(options)) return null
  return algosdk.multisigAddress(options)
}

/** Determine standard multisig options from raw msig struct */
export function multisigOptionsFromRawTransactionMultisig(
  msig: AlgorandMultiSignatureMsigStruct,
): AlgorandMultisigNativeCreateAccountOptions {
  if (isNullOrEmpty(msig)) return null
  const addrs = msig.subsig?.map(sig => toAlgorandAddressFromPublicKeyByteArray(sig.pk))
  return {
    version: msig?.v,
    threshold: msig?.thr,
    addrs,
  }
}
