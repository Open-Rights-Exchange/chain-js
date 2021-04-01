import { MultisigCreateAccount } from './multisigCreateAccount'
import { MultisigTransaction } from './multisigTransaction'

export interface MultisigPlugin {
  transaction: MultisigTransaction
  createAccount: MultisigCreateAccount
}
