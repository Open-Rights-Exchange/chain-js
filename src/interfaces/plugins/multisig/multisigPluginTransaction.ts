import { PrivateKey } from '../../../models'

export interface MultisigPluginTransaction {
  init(options: any): Promise<void>

  options: any

  owners: any[]

  threshold: number

  /** Whether parent transaction has been set yet */
  hasParentTransaction: boolean

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRawTransaction: boolean

  /** List of accounts transaction can be signed by - but have not signed yet */
  missingSignatures: any[]

  /** Parent transaction is what gets sent to chain
   * Actual transaction actions are embedded in parent transaction data
   */
  parentRawTransaction: any

  /** Whether transaction has been prepared for signing (has raw body) */
  rawTransaction: any

  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: any[]

  /** Wether multisigPlugin requires transaction body to be wrapped in a parent transaction
   * For chains that don't support multisig natively
   */
  requiresParentTransaction?: boolean

  /** Signatures attached to transaction */
  signatures: any[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: any[]): Promise<void>

  prepareToBeSigned(rawTransaction: any): Promise<void>

  setFromRaw(rawTransaction: any): Promise<void>

  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: PrivateKey[]): Promise<void>

  validate(): Promise<void>
}
