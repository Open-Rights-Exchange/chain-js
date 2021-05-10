import { MultisigOptions } from '../../../models'
import { MultisigPlugin } from '../../../interfaces/plugins/multisig'

export interface EthereumMultisigPluginInput {
  multisigOptions?: MultisigOptions
}

export interface EthereumMultisigPlugin extends MultisigPlugin {
  /** Transaction's actions */
  multisigOptions: any
  /** Chain-specific and time-sensitive transaction header */
  multisigOptionsFromRaw: any
  /** Raw transaction body
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: any
  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean

  missingSignatures: any[]
  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: any[]
  /** Signatures attached to transaction */
  signatures: any[]

  assertMultisigFromMatchesOptions(action: any | any | any | any): void

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: any[]): Promise<void>

  validate(): void

  prepareToBeSigned(trxEncodedForChain: any): Promise<void>
  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: any[]): Promise<void>

  accountName: any

  transaction: any

  requiresTransaction: boolean

  generateKeysIfNeeded(): Promise<void>
}
