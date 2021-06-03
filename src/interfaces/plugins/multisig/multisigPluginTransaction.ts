import { PrivateKey } from '../../../models'

export interface MultisigPluginTransaction {
  init(options: any): Promise<void>

  options: any

  owners: any[]

  threshold: number

  /** Wether multisigPlugin requires transaction body to be wrapped in a parent transaction
   * For chains that don't support multisig natively
   */
  requiresParentTransaction?: boolean

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRawTransaction: boolean
  /** Raw transaction body type is dependent on each plugin
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: any

  hasParentTransaction: boolean

  /** Parent transaction is what gets sent to chain
   * Actual transaction (child in this case) is embedded in parent transaction data
   */
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
