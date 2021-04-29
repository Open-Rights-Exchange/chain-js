import { AlgorandAddress } from '../../models'
import { AlgorandMultisigPlugin } from '../algorandMultisigPlugin'

export type AlgorandNativeMultisigOptions = {
  pluginOptions: { version: number }
  threshold: number
  addrs: AlgorandAddress[]
  plugin?: AlgorandMultisigPlugin
}
