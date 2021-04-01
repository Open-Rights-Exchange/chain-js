import { AlgorandMultisigPlugin, AlgorandMultisigPluginInput, AlgorandMultisigPluginType } from './models'

import { AlgorandMultisigNativePlugin } from './native/multisigNative'

export class AlgorandMultisigPluginFactory {
  public create = (
    input: AlgorandMultisigPluginInput,
    pluginType?: AlgorandMultisigPluginType,
  ): AlgorandMultisigPlugin => {
    switch (pluginType) {
      case AlgorandMultisigPluginType.Native:
        return new AlgorandMultisigNativePlugin(input)
      default:
        return new AlgorandMultisigNativePlugin(input)
    }
  }
}
