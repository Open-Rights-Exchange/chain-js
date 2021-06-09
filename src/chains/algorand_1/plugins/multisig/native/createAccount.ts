import { AlgorandAddress, AlgorandEntityName } from '../../../models'
import { toAlgorandEntityName } from '../../../helpers'
import { throwNewError } from '../../../../../errors'
import { AlgorandMultisigPluginCreateAccount } from '../algorandMultisigPlugin'

import { AlgorandMultisigNativeCreateAccountOptions } from './models'
import { determineMultiSigAddress } from './helpers'

export class NativeMultisigPluginCreateAccount implements AlgorandMultisigPluginCreateAccount {
  private _options: AlgorandMultisigNativeCreateAccountOptions

  private _multisigAddress: AlgorandAddress

  public requiresTransaction = false

  constructor(options: AlgorandMultisigNativeCreateAccountOptions) {
    this._options = options
  }

  async init(): Promise<void> {
    return null
  }

  get multisigAddress(): AlgorandAddress {
    return this._multisigAddress
  }

  get options(): AlgorandMultisigNativeCreateAccountOptions {
    return this._options
  }

  get owners(): string[] {
    return this.options?.addrs
  }

  get threshold(): number {
    return this.options?.threshold
  }

  get accountName(): AlgorandEntityName {
    return toAlgorandEntityName(determineMultiSigAddress(this.options))
  }

  async generateKeysIfNeeded() {
    return throwNewError('Not supported')
  }

  get transactionAction(): any {
    throwNewError(
      'Algorand account creation does not require any on chain transactions. You should always first check the supportsTransactionToCreateAccount property - if false, transaction is not supported/required for this chain type',
    )
    return null
  }
}
