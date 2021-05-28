import { PrivateKey } from '../../../models'

export interface MultisigPluginTransaction {
  init(options: any): Promise<void>

  options: any

  owners: any[]

  threshold: number

  /** True if multisigPlugin's rawTransaction needs to be wrapped into it's native chain transaction
   * Used for platforms that doesn't support multisig natively
   */
  requiresParentTransaction?: boolean

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRawTransaction: boolean
  /** Raw transaction body type is dependent on each plugin
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: any

  hasParentTransaction: boolean

  /** Parent transaction that contains serialized multisig rawTransaction */
  parentTransaction: any

  missingSignatures: any[]

  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: any[]

  /** Signatures attached to transaction */
  signatures: any[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: any[]): void

  prepareToBeSigned(rawTransaction: any): Promise<void>

  setFromRaw(rawTransaction: any): Promise<void>

  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: PrivateKey[]): Promise<void>

  validate(): Promise<void>
}
