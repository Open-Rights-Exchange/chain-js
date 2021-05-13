import * as algosdk from 'algosdk'
import { isNullOrEmpty } from '../../../../../helpers'
import { MultisigOptions } from '../../../../../models'
import { AlgorandMultiSigAccount } from '../../../models'

/** Calculates the multisig address using the multisig options including version, threshhold and addresses */
export function determineMultiSigAddress(multisigOptions: MultisigOptions): AlgorandMultiSigAccount {
  if (isNullOrEmpty(multisigOptions)) return null
  const mSigOptions = {
    version: multisigOptions.pluginOptions?.version,
    threshold: multisigOptions.weight,
    addrs: multisigOptions.addrs,
  }
  return algosdk.multisigAddress(mSigOptions)
}
