import { AlgorandAddress } from '../../../models'

export type AlgorandNativeMultisigOptions = {
  pluginOptions: { version: number }
  weight: number
  addrs: AlgorandAddress[]
}
