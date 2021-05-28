import { isNullOrEmpty } from '../../../../../helpers'
import { throwNewError } from '../../../../../errors'
import { toEthereumEntityName } from '../../../helpers'
import { EthereumAddress, EthereumEntityName, EthereumTransactionAction } from '../../../models'
import { EthereumMultisigPluginCreateAccount } from '../ethereumMultisigPlugin'
import {
  applyDefaultAndSetCreateOptions,
  calculateProxyAddress,
  getCreateProxyTransaction,
  getEthersJsonRpcProvider,
  getGnosisSafeContract,
} from './helpers'
import { EthereumGnosisMultisigCreateAccountOptions } from './models'

export class GnosisSafeMultisigPluginCreateAccount implements EthereumMultisigPluginCreateAccount {
  private _options: EthereumGnosisMultisigCreateAccountOptions

  private _chainUrl: string

  private _multisigAddress: EthereumAddress

  private _createAccountTransactionAction: EthereumTransactionAction

  public requiresTransaction = true

  constructor(options: EthereumGnosisMultisigCreateAccountOptions, chainUrl: string) {
    this._chainUrl = chainUrl
    this._options = applyDefaultAndSetCreateOptions(options)
  }

  /** Allows parent class to (re)initialize options */
  async init() {
    // TODO: Check whether account has already been created using the same params (and nonce) - throw if so
    this._multisigAddress = await this.getMultisigAddressFromOptions()
    this._createAccountTransactionAction = await this.getTransactionFromOptions()
  }

  // ----------------------- TRANSACTION Members ----------------------------

  get options(): EthereumGnosisMultisigCreateAccountOptions {
    return this._options
  }

  get multisigAddress(): EthereumAddress {
    return this._multisigAddress
  }

  get owners(): EthereumAddress[] {
    return this._options?.owners
  }

  get threshold(): number {
    return this._options?.threshold
  }

  get chainUrl(): string {
    return this._chainUrl
  }

  get multisigContract(): any {
    const ethersProvier = getEthersJsonRpcProvider(this.chainUrl)
    return getGnosisSafeContract(ethersProvier, this.multisigAddress)
  }

  /** If multisigAddress is provided in options, verify that it matches address calculated using the other multisigOptions
   *  Calls the multisig contract on chain to get the calculated address */
  public async getMultisigAddressFromOptions() {
    const { options } = this
    const { owners, threshold, saltNonce: nonce } = options
    let calculatedAddress = this.multisigAddress

    // if ANY multisigOptions is provided, then calculate the multisig address
    if (!isNullOrEmpty(owners) || !isNullOrEmpty(threshold) || !isNullOrEmpty(nonce)) {
      calculatedAddress = await calculateProxyAddress(this.options, this.chainUrl)
      if (this.multisigAddress && calculatedAddress !== this.multisigAddress) {
        throwNewError('multisigAddress and multisigOptions do not match!')
      }
    } else if (!this.multisigAddress) {
      throwNewError('must provide either multisigAddress or multisigOptions (to calculate multisig address)')
    }

    return calculatedAddress
  }

  // ----------------------- CREATE ACCOUNT Members ----------------------------

  get accountName(): EthereumEntityName {
    if (!this._multisigAddress) {
      return null
    }
    return toEthereumEntityName(this._multisigAddress)
  }

  get transactionAction(): EthereumTransactionAction {
    if (!this._createAccountTransactionAction)
      throwNewError('createAccountTransactionAction is missing. Make sure you init() with createAccountOptions')
    return this._createAccountTransactionAction
  }

  /**  Calls the multisig contract on chain to get the calculated transaction data to create proxy multisigAccount */
  public async getTransactionFromOptions() {
    const { options } = this
    const { owners, threshold, saltNonce } = options
    let transaction

    // if ANY multisigOptions is provided, then calculate the multisig address
    if (!isNullOrEmpty(owners) || !isNullOrEmpty(threshold) || !isNullOrEmpty(saltNonce)) {
      transaction = await getCreateProxyTransaction(this.options, this.chainUrl)
    } else {
      throwNewError('must provide either multisigAddress or multisigOptions (to calculate multisig address)')
    }

    return transaction
  }

  /** nothing to do for this plugin */
  public async generateKeysIfNeeded() {
    // nothing to do
  }
}
