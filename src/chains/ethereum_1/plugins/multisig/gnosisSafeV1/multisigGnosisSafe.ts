import { EthereumGnosisCreateAccountOptions, EthereumGnosisTransactionOptions } from './models'
import { ChainJsPlugin, PluginType } from '../../../../../interfaces/plugin'
import { GnosisSafeMultisigPluginCreateAccount } from './createAccountPlugin'
import { GnosisSafeMultisigPluginTransaction } from './transactionPlugin'
import { throwNewError } from '../../../../../errors'
import { EthereumMultisigPlugin } from '../ethereumMultisigPlugin'

export class GnosisSafeMultisigPlugin extends ChainJsPlugin implements EthereumMultisigPlugin {
  public name = 'Gnosis V1 Multisig Plugin'

  public type = PluginType.MultiSig

  // No initalization required
  protected _isInitialized: boolean = true

  /** Allows parent class to (re)initialize options */
  async init(input: any) {
    super.init(input)
  }

  // This is not actually needed because this plugin doesn't need to be initalized, hence isInitialized always true
  private assertInitialized() {
    if (!this.isInitialized) {
      throwNewError('Plugin needs to be initalized')
    }
  }

  public newCreateAccount = async (options?: EthereumGnosisCreateAccountOptions) => {
    this.assertInitialized()
    const createAccountPlugin = new GnosisSafeMultisigPluginCreateAccount(options, this.chainState?.endpoints[0]?.url)
    await createAccountPlugin.init()
    return createAccountPlugin
  }

  public newTransaction = async (options?: EthereumGnosisTransactionOptions) => {
    this.assertInitialized()
    const transactionPlugin = new GnosisSafeMultisigPluginTransaction(options, this.chainState?.endpoints[0]?.url)
    await transactionPlugin.init()
    return transactionPlugin
  }
}
