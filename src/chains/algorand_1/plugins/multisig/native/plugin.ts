import { throwNewError } from '../../../../../errors'
import { AlgorandMultisigNativeCreateAccountOptions, AlgorandMultisigNativeTransactionOptions } from './models'
import { ChainJsPlugin, PluginType } from '../../../../../interfaces/plugin'
import { NativeMultisigPluginCreateAccount } from './createAccount'
import { NativeMultisigPluginTransaction } from './transaction'
import { MultisigPlugin } from '../../../../../interfaces/plugins/multisig'

export class NativeMultisigPlugin extends ChainJsPlugin implements MultisigPlugin {
  public name = 'Algorand Native Multisig Plugin'

  public type = PluginType.MultiSig

  // This plug-in does not require initalization
  protected _isInitialized: boolean = true

  async init(options: any) {
    /** Pass along options so parent class can initialize */
    super.init(options)
  }

  // This is not actually needed because this plugin doesn't need to be initalized, hence isInitialized always true
  private assertInitialized() {
    if (!this.isInitialized) {
      throwNewError('Plugin needs to be initalized')
    }
  }

  private newCreateAccount = async (options?: AlgorandMultisigNativeCreateAccountOptions) => {
    this.assertInitialized()
    const createAccountPlugin = new NativeMultisigPluginCreateAccount(options)
    await createAccountPlugin.init()
    return createAccountPlugin
  }

  private newTransaction = async (options?: AlgorandMultisigNativeTransactionOptions) => {
    this.assertInitialized()
    const transactionPlugin = new NativeMultisigPluginTransaction(options)
    await transactionPlugin.init()
    return transactionPlugin
  }

  public new = {
    CreateAccount: this.newCreateAccount.bind(this),
    Transaction: this.newTransaction.bind(this),
  }
}
