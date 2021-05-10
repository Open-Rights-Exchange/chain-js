import { EthereumMultisigPlugin, EthereumMultisigPluginInput } from '../plugins/ethereumMultisigPlugin'
import { GnosisSafeMultisigPlugin } from '../plugins/gnosisSafe/multisigGnosisSafe'

export function setMultisigPlugin(input: EthereumMultisigPluginInput): EthereumMultisigPlugin {
  const { multisigOptions } = input
  if (!multisigOptions) return null
  return multisigOptions?.plugin || new GnosisSafeMultisigPlugin(input)
}
