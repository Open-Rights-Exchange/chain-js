import { ChainJsPlugin, PluginType } from '../../plugin'
import { MultisigPluginCreateAccount } from './multisigPluginCreateAccount'
import { MultisigPluginTransaction } from './multisigPluginTransaction'

export type MultisigPluginOptions = any

export interface MultisigPlugin extends ChainJsPlugin {
  name: string

  type: PluginType

  init(input: MultisigPluginOptions): Promise<void>

  newCreateAccount(options: any): Promise<MultisigPluginCreateAccount>

  newTransaction(options: any): Promise<MultisigPluginTransaction>
}
