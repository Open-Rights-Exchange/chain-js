export type AlgorandNativeMultisigOptions = {
  version: number
  threshold: number
  addrs: string[]
}

export type AlgorandMultisigNativePluginOptions = {
  multisigAddress?: string
  raw?: any
  multisigOptions?: AlgorandNativeMultisigOptions
}
