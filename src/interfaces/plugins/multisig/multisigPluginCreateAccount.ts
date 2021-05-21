import { ChainEntityName } from '../../../models'

export interface MultisigPluginCreateAccount {
  init(options: any): Promise<void>

  options: any

  owners: any[]

  threshold: number

  /** Account named used when creating the account */
  accountName: ChainEntityName

  /** Compose the transaction action needed to create the account */
  transactionAction: any

  /** If true, an transaction must be sent to chain to create account - use createAccountTransactionAction for action needed */
  requiresTransaction: boolean

  generateKeysIfNeeded(): Promise<void>
}
