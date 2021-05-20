import { PluginType, ChainJsPlugin } from '../../../../interfaces/plugin'
import { MultisigPluginTransaction, MultisigPluginCreateAccount } from '../../../../interfaces'
import { EthereumAddress } from '../../models'

type EthereumMultisigPluginInput = {
  multisigAddress?: EthereumAddress
  createAccountOptions?: any
  transactionOptions?: any
}

export interface EthereumMultisigPlugin extends ChainJsPlugin {
  name: string

  type: PluginType

  init(input: EthereumMultisigPluginInput): Promise<void>

  newCreateAccount(options: any): Promise<EthereumMultisigPluginCreateAccount>

  newTransaction(options: any): Promise<EthereumMultisigPluginTransaction>
}

export interface EthereumMultisigPluginCreateAccount extends MultisigPluginCreateAccount {
  init(input: EthereumMultisigPluginInput): Promise<void>

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
  init(input: EthereumMultisigPluginInput): Promise<void>

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
  addSignatures(signature: any[]): Promise<void>

  prepareToBeSigned(trxEncodedForChain: any): Promise<void>

  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: any[]): Promise<void>

  validate(): void
}
