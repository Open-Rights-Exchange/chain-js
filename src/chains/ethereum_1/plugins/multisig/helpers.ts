import { EthereumMultisigPlugin, EthereumMultisigPluginInput } from './ethereumMultisigPlugin'
import { GnosisSafeMultisigPlugin } from './gnosisSafe/multisigGnosisSafe'

export function setMultisigPlugin(input: EthereumMultisigPluginInput): EthereumMultisigPlugin {
  const { multisigOptions } = input
  if (!multisigOptions) return null
  return multisigOptions?.plugin || new GnosisSafeMultisigPlugin(input)
}
