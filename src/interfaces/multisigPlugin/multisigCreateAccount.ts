import { ChainEntityName } from '../../models'
import { MultisigTransaction } from './multisigTransaction'

export interface MultisigCreateAccount {
  accountName: ChainEntityName

  transaction: MultisigTransaction

  generateKeysIfNeeded(): Promise<void>
}
