import { EthereumGnosisMultisigCreateAccountOptions, EthereumGnosisMultisigTransactionOptions } from './models'
import { ChainJsPlugin, PluginType } from '../../../../../interfaces/plugin'
import { GnosisSafeMultisigPluginCreateAccount } from './createAccount'
import { GnosisSafeMultisigPluginTransaction } from './transaction'
import { throwNewError } from '../../../../../errors'
import { MultisigPlugin } from '../../../../../interfaces/plugins/multisig'

export class GnosisSafeMultisigPlugin extends ChainJsPlugin implements MultisigPlugin {
  public name = 'Gnosis Multisig Plugin V1'

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

  private newCreateAccount = async (options?: EthereumGnosisMultisigCreateAccountOptions) => {
    this.assertInitialized()
    const createAccountPlugin = new GnosisSafeMultisigPluginCreateAccount(options, this.chainState.activeEndpoint.url)
    await createAccountPlugin.init()
    return createAccountPlugin
  }

  private newTransaction = async (options?: EthereumGnosisMultisigTransactionOptions) => {
    this.assertInitialized()
    const transactionPlugin = new GnosisSafeMultisigPluginTransaction(options, this.chainState.activeEndpoint.url)
    await transactionPlugin.init()
    return transactionPlugin
  }

  public new = {
    CreateAccount: this.newCreateAccount.bind(this),
    Transaction: this.newTransaction.bind(this),
  }
}
