import { AlgorandMultiSigOptions } from "../models/multisig";
import { AlgorandMultisigPlugin } from "../plugins/algorandMultisigPlugin";
import { AlgorandMultisigNativePlugin } from "../plugins/native/multisigNative";

export function setMultisigPlugin(multiSigOptions: AlgorandMultiSigOptions): AlgorandMultisigPlugin {
  if(!multiSigOptions) return null
  return this._multisigPlugin = multiSigOptions?.plugin || new AlgorandMultisigNativePlugin({multiSigOptions})
}