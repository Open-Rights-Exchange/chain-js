import { AlgorandAddress } from '../../models'

export type AlgorandNativeMultisigOptions = {
  pluginOptions: { version: number }
  threshold: number
  addrs: AlgorandAddress[]
}
