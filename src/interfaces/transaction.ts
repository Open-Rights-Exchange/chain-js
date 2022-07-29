import {
  ActualCost,
  ConfirmType,
  PrivateKey,
  PublicKey,
  Signature,
  TransactionCost,
  TransactionOptions,
  TransactionResources,
  TransactionResult,
  TxExecutionPriority,
} from '../models'
/**
 * The Transaction interface declares the operations that all concrete chain (chain)transaction classes must implement
 */
export interface Transaction {
  /** Transaction's actions */
  actions: any
  /** Chain-specific and time-sensitive transaction header */
  header: any
  /** Transction options set in constructor */
  options: TransactionOptions
  /** Raw transaction body
   *  Note: Set via prepareToBeSigned() or setTransaction() */
  raw: any
  /** Whether there is an attached signature for every authorization (e.g. account/permission) in all actions */
  hasAllRequiredSignatures: boolean
  /** Whether there are any signatures attached */
  hasAnySignatures: boolean
  /** Transaction that is generated by child transaction to execute on chain */
  parentTransaction: Transaction
  /** Wether multisigPlugin requires transaction body to be wrapped in a parent transaction
   * For chains that don't support multisig natively
   */
  hasParentTransaction: boolean
  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean
  /** Whether the transaction is a multi-signature transaction */
  isMultisig: boolean
  // ** Whether transaction has been validated - via vaidate() */
  isValidated: boolean
  /** An array of authorizations (chain-specific result type) that do not have an attached signature
   *  Retuns null if no signatures are missing */
  missingSignatures: any[]
  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: any[]
  /** Signatures attached to transaction */
  requiresParentTransaction: boolean
  /** Whether parent transaction has been set yet */
  signatures: string[]
  /** The transaction data needed to create a transaction signature.
   *  It should be signed with a private key. */
  signBuffer: any
  /** Whether the chain allow a pending transaction to be cancelled */
  supportsCancel: boolean
  /** Whether the chain supports signing a transactions using a multi-signature account */
  supportsMultisigTransaction: boolean
  /** Returns transaction hash that can be used to query the transaction on chain
   *  Cannot be called before signing the transaction */
  transactionId: string
  /** Cost that is paid after transaction has executed on chain
   * Return format is up to chain's supported fee/resources structure */
  actualCost: ActualCost
  /** Add an action to the array of attached actions.
   *  Can't add action if any signatures are attached
   *  since it would invalidate existing signatures. */
  addAction(action: any, asFirstAction?: boolean): void
  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: Signature[]): Promise<void>
  /** Date (and time) transaction expires - not supported by all chains */
  expiresOn(): Promise<Date>
  /** Whether there is an attached signature for the publicKey for the authorization (e.g. account/permission)
   *  May need to call chain (async) to fetch publicKey(s) for authorization(s) */
  hasSignatureForAuthorization?(authorization: any): Promise<boolean>
  /** Whether there is an attached signature for the provided publicKey */
  hasSignatureForPublicKey(publicKey: PublicKey): boolean
  /** Whether the transaction has expired - not supported by all chains */
  isExpired(): Promise<boolean>
  /** Get the suggested fee for this transaction */
  getSuggestedFee(priority: TxExecutionPriority): Promise<TransactionCost>
  /** Internally creates Raw Transaction data.
   *  Requires at least one action set. Must be called before sign() */
  prepareToBeSigned(): Promise<void>
  /** Gets estimated cost in chain specific units to execute this transaction (at current chain rates) */
  resourcesRequired(): Promise<TransactionResources>
  /** set the fee that you would like to pay (based on maxFeeIncreasePercentage) */
  setDesiredFee(desiredFee: TransactionCost, options?: any): Promise<void>
  /** Set the body of the transaction using actions or raw transaction data
   *  This is one of the ways to set the actions for the transaction */
  setTransaction(transaction: any): Promise<void>
  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block (or irreversable block) before returning */
  send(waitForConfirm?: ConfirmType, communicationSettings?: any): Promise<TransactionResult>
  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: PrivateKey[]): Promise<void>
  /** JSON representation of transaction data */
  toJson(): ConfirmType.None
  /** Ensures that the value comforms to a well-formed signature */
  toSignature(value: string): Signature
  /** Verifies that all accounts and permisison for actions exist on chain.
   *  Throws if any problems */
  validate(): Promise<void>
  /** Date (and time) when transaction can first be sent to the chain (before which the transaction will fail) - not supported by all chains */
  validOn(): Promise<Date>
}
