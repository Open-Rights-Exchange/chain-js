import { AlgorandMultisigPlugin, AlgorandMultisigPluginInput } from '../plugins/algorandMultisigPlugin'
import { AlgorandMultisigNativePlugin } from '../plugins/native/multisigNative'

export function setMultisigPlugin(input: AlgorandMultisigPluginInput): AlgorandMultisigPlugin {
  const { multisigOptions, raw } = input
  if (!multisigOptions && !raw) return null
  return multisigOptions?.plugin || new AlgorandMultisigNativePlugin(input)
}
