import { TransactionOptions, ConfirmType, Signature, PublicKey, PrivateKey } from '../models'

/**
 * The Transaction interface declares the operations that all concrete chain (chain)transaction classes must implement
 */
export interface Transaction {
  /** Transaction's actions */
  actions: any
  /** Chain-specific and time-sensitive transaction header
   *  Header is included in a serialized transaction body */
  header: any
  /** Transction options set in constructor */
  options: TransactionOptions
  /** Serialized transaction body
   *  Note: Set via generateSerialized() or setSerialized() */
  serialized: any
  /** Whether there is an attached signature for every authorization (e.g. account/permission) in all actions */
  hasAllRequiredSignatures: boolean
  /** Whether there are any signatures attached */
  hasAnySignatures: boolean
  /** Whether transaction is missing serialized body */
  hasSerialized: boolean
  // ** Whether transaction has been validated - via vaidate() */
  isValidated: boolean
  /** An array of authorizations (e.g. account/permission) that do not have an attached signature
   *  Retuns null if no signatures are missing */
  missingSignatures: any[]
  /** An array of the unique set of account/permission/publicKey for all actions in transaction
   *  Also fetches the related accounts from the chain (to get public keys) */
  requiredAuthorizations: any[]
  /** Signatures attached to transaction */
  signatures: string[]
  /** The transaction data needed to create a transaction signature.
   *  It should be signed with a private key. */
  signBuffer: any
  /** Add an action to the array of attached actions.
   *  Can't add action if any signatures are attached
   *  since it would invalidate existing signatures. */
  addAction(action: any, options?: any): void
  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: Signature[]): void
  /** Whether there is an attached signature for the publicKey for the authorization (e.g. account/permission)
   *  May need to call chain (async) to fetch publicKey(s) for authorization(s) */
  hasSignatureForAuthorization?(authorization: any): Promise<boolean>
  /** Whether there is an attached signature for the provided publicKey */
  hasSignatureForPublicKey(publicKey: PublicKey): boolean
  /** Generates a serialized transaction (using actions already attached)
   *  uses eosjs.transact which fetches action and account info from the chain */
  generateSerialized(): Promise<void>
  /** Sets transaction data from serialized transaction - supports both serialized formats (JSON bytes array and hex)
   *  This is an ASYNC call since it fetches (cached) action contract schema from chain in order to deserialize action data */
  setSerialized(serialized: any): Promise<void>
  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block (or irreversable block) before returning */
  send(waitForConfirm?: ConfirmType): Promise<any>
  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: PrivateKey[]): void
  /** JSON representation of transaction data */
  toJson(): ConfirmType.None
  /** Verifies that all accounts and permisison for actions exist on chain.
   *  Throws if any problems */
  validate(): Promise<void>
}
