import { AlgorandMultisigPlugin, AlgorandMultisigPluginInput } from './algorandMultisigPlugin'
import { AlgorandMultisigNativePlugin } from './native/multisigNative'

export function setMultisigPlugin(input: AlgorandMultisigPluginInput): AlgorandMultisigPlugin {
  const { multisigOptions, raw } = input
  if (!multisigOptions && !raw) return null
  return multisigOptions?.plugin || new AlgorandMultisigNativePlugin(input)
}
