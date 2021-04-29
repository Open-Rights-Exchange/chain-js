import { Transaction } from '../transaction'
import { ChainEntityName, MultisigOptions, PrivateKey, Signature } from '../../models'

export interface MultisigPlugin {
  // TRANSACTION
  multisigOptions: MultisigOptions
  /** Chain-specific and time-sensitive transaction header */
  multisigOptionsFromRaw: MultisigOptions
  /** Raw transaction body
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: any
  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean

  missingSignatures: any[]
  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: any[]
  /** Signatures attached to transaction */
  signatures: string[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: Signature[]): void

  prepareToBeSigned(rawTransaction: any): Promise<void>

  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(actionEncodedForSdk: any, privateKeys: PrivateKey[], transactionId: string): Promise<void>

  // CREATEACCOUNT
  accountName: ChainEntityName

  transaction: Transaction

  generateKeysIfNeeded(): Promise<void>
}
