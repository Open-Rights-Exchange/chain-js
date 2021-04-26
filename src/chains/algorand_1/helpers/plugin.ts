import { AlgorandMultiSigOptions, AlgorandMultisigPluginInput } from "../models/multisig";
import { AlgorandMultisigPlugin } from "../plugins/algorandMultisigPlugin";
import { AlgorandMultisigNativePlugin } from "../plugins/native/multisigNative";

export function setMultisigPlugin(input: AlgorandMultisigPluginInput): AlgorandMultisigPlugin {
  const { multiSigOptions, raw} = input
  if(!multiSigOptions && !raw) return null
  return this._multisigPlugin = multiSigOptions?.plugin || new AlgorandMultisigNativePlugin(input)
}