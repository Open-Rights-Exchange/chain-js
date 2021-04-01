import { AlgorandMultisigNativeCreateAccount } from './multisigNativeCreateAccountPlugin'
import { AlgorandMultisigNativeTransaction } from './multisigNativeTransactionPlugin'
import { AlgorandMultisigPlugin, AlgorandMultisigPluginInput } from '../models'

export class AlgorandMultisigNativePlugin implements AlgorandMultisigPlugin {
  _transaction: AlgorandMultisigNativeTransaction

  _createAccount: AlgorandMultisigNativeCreateAccount

  constructor(options: AlgorandMultisigPluginInput) {
    this._transaction = new AlgorandMultisigNativeTransaction(options)
    this._createAccount = new AlgorandMultisigNativeCreateAccount(options)
  }

  get transaction() {
    return this._transaction
  }

  get createAccount() {
    return this._createAccount
  }
}
