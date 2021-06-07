import { PluginType } from '../../../../interfaces/plugin'
import {
  MultisigPluginTransaction,
  MultisigPluginCreateAccount,
  MultisigPlugin,
  MultisigPluginOptions,
} from '../../../../interfaces/plugins/multisig'
import { EthereumAddress, EthereumPrivateKey, EthereumTransactionAction } from '../../models'
import { EthereumMultisigRawTransaction } from './gnosisSafeV1/models'

export type EthereumMultisigTransactionOptions = any
export type EthereumMultisigCreateAccountOptions = any

export interface EthereumMultisigPlugin extends MultisigPlugin {
  name: string

  type: PluginType

  init(options: MultisigPluginOptions): Promise<void>

  new: {
    /** Return a new CreateAccount object used to help with creating a new chain account */
    CreateAccount(options?: EthereumMultisigCreateAccountOptions): Promise<EthereumMultisigPluginCreateAccount>
    /** Return a chain Transaction object used to compose and send transactions */
    Transaction(options?: EthereumMultisigTransactionOptions): Promise<EthereumMultisigPluginTransaction>
  }
}

export interface EthereumMultisigPluginCreateAccount extends MultisigPluginCreateAccount {
  init(options: EthereumMultisigCreateAccountOptions): Promise<void>

  options: EthereumMultisigCreateAccountOptions

  owners: EthereumAddress[]

  threshold: number

  /** Account named used when creating the account */
  accountName: EthereumAddress

  /** Compose the transaction action needed to create the account */
  transactionAction: EthereumTransactionAction

  /** If true, an transaction must be sent to chain to create account - use createAccountTransactionAction for action needed */
  requiresTransaction: boolean

  generateKeysIfNeeded(): Promise<void>
}

export interface EthereumMultisigPluginTransaction extends MultisigPluginTransaction {
  init(options: EthereumMultisigTransactionOptions): Promise<void>

  options: EthereumMultisigTransactionOptions // depends on plug-in

  owners: EthereumAddress[]

  threshold: number

  transactionHash: string

  /** Whether parent transaction has been set yet */
  hasParentTransaction: boolean

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRawTransaction: boolean

  /** List of accounts transaction can be signed by - but have not signed yet */
  missingSignatures: EthereumAddress[]

  /** Parent transaction is what gets sent to chain
   * Actual transaction actions are embedded in parent transaction data
   */
  parentRawTransaction: EthereumMultisigRawTransaction

  /** Raw transaction body type is dependent on each plugin
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: any

  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: EthereumAddress[]

  /** Wether multisigPlugin requires transaction body to be wrapped in a parent transaction
   * For chains that don't support multisig natively
   */
  requiresParentTransaction?: boolean

  /** Ethereum only supports one signature on a transaction so transaction wont ask multisig plugin for signature list - those are data in the contract */
  // signatures: EthereumSignature[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: any[]): void

  prepareToBeSigned(transactionAction: EthereumTransactionAction): Promise<void>

  setFromRaw(rawTransaction: any): Promise<void>

  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: EthereumPrivateKey[]): Promise<void>

  validate(): Promise<void>
}
