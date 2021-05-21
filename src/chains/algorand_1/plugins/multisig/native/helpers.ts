import * as algosdk from 'algosdk'
import { isNullOrEmpty } from '../../../../../helpers'
import { AlgorandMultiSigAccount } from '../../../models'
import { AlgorandNativeMultisigOptions } from './models'

/** Calculates the multisig address using the multisig options including version, threshhold and addresses */
export function determineMultiSigAddress(options: AlgorandNativeMultisigOptions): AlgorandMultiSigAccount {
  if (isNullOrEmpty(options)) return null
  return algosdk.multisigAddress(options)
}
