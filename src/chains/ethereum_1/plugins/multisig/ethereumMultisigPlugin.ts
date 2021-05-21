import { MultisigPluginTransaction, MultisigPluginCreateAccount } from '../../../../interfaces/plugins/multisig'

export interface EthereumMultisigPluginCreateAccount extends MultisigPluginCreateAccount {
  init(input: any): Promise<void>

  options: any

  owners: string[]

  threshold: number

  /** Account named used when creating the account */
  accountName: any

  /** Compose the transaction action needed to create the account */
  transactionAction: any

  /** If true, an transaction must be sent to chain to create account - use createAccountTransactionAction for action needed */
  requiresTransaction: boolean

  generateKeysIfNeeded(): Promise<void>
}

export interface EthereumMultisigPluginTransaction extends MultisigPluginTransaction {
  init(input: any): Promise<void>

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean

  options: any

  owners: string[]

  threshold: number

  missingSignatures: any[]

  /** Raw transaction body
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: any

  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: any[]

  /** Signatures attached to transaction */
  signatures: any[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: any[]): void

  prepareToBeSigned(trxEncodedForChain: any): Promise<void>

  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: any[]): Promise<void>

  validate(): void
}
