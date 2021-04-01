import { throwNewError } from '../../../../errors'
import { MultisigCreateAccount } from '../../../../interfaces/multisigPlugin/multisigCreateAccount'
import { AlgorandEntityName } from '../../models'
import { determineMultiSigAddress, toAlgorandEntityName } from '../../helpers'
import { AlgorandMultiSigOptions, AlgorandMultisigPluginInput } from '../models'

export class AlgorandMultisigNativeCreateAccount implements MultisigCreateAccount {
  private _multiSigOptions: AlgorandMultiSigOptions

  constructor(input: AlgorandMultisigPluginInput) {
    this._multiSigOptions = input?.multiSigOptions
  }

  get multisigOptions() {
    return this._multiSigOptions
  }

  get accountName(): AlgorandEntityName {
    return toAlgorandEntityName(determineMultiSigAddress(this.multisigOptions))
  }

  async generateKeysIfNeeded() {
    return throwNewError('Not supported')
  }

  get transaction(): any {
    throwNewError(
      'Algorand account creation does not require any on chain transactions. You should always first check the supportsTransactionToCreateAccount property - if false, transaction is not supported/required for this chain type',
    )
    return null
  }
}
