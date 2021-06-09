import { ChainJsPlugin, PluginType } from '../../plugin'
import { MultisigPluginCreateAccount } from './multisigPluginCreateAccount'
import { MultisigPluginTransaction } from './multisigPluginTransaction'

export type MultisigPluginOptions = any

export type MultisigPluginNew = {
  CreateAccount: Promise<MultisigPluginCreateAccount>
  Transaction: Promise<MultisigPluginTransaction>
}

export interface MultisigPlugin extends ChainJsPlugin {
  name: string

  type: PluginType

  init(options: MultisigPluginOptions): Promise<void>

  new: {
    /** Return a new CreateAccount object used to help with creating a new chain account */
    CreateAccount(options?: any): Promise<MultisigPluginCreateAccount>
    /** Return a chain Transaction object used to compose and send transactions */
    Transaction(options?: any): Promise<MultisigPluginTransaction>
  }
}
