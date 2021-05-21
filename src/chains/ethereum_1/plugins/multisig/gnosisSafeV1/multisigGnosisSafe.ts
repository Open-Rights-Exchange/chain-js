import { EthereumGnosisCreateAccountOptions, EthereumGnosisTransactionOptions } from './models'
import { ChainJsPlugin, PluginType } from '../../../../../interfaces/plugin'
import { GnosisSafeMultisigPluginCreateAccount } from './createAccountPlugin'
import { GnosisSafeMultisigPluginTransaction } from './transactionPlugin'
import { throwNewError } from '../../../../../errors'
import { EthereumMultisigPlugin } from '../ethereumMultisigPlugin'

export class GnosisSafeMultisigPlugin extends ChainJsPlugin implements EthereumMultisigPlugin {
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

  public newCreateAccount = async (options?: EthereumGnosisCreateAccountOptions) => {
    this.assertInitialized()
    const createAccountPlugin = new GnosisSafeMultisigPluginCreateAccount(options, this.chainState.activeEndpoint.url)
    await createAccountPlugin.init()
    return createAccountPlugin
  }

  public newTransaction = async (options?: EthereumGnosisTransactionOptions) => {
    this.assertInitialized()
    const transactionPlugin = new GnosisSafeMultisigPluginTransaction(options, this.chainState.activeEndpoint.url)
    await transactionPlugin.init()
    return transactionPlugin
  }
}
