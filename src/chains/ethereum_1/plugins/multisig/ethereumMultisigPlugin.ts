import { MultisigOptions } from '../../../../models'
import { MultisigPlugin } from '../../../../interfaces/plugins/multisig'

export interface EthereumMultisigPluginInput {
  multisigOptions?: MultisigOptions
}

export interface EthereumMultisigPlugin extends MultisigPlugin {
  // ----- TRANSACTION Members

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean

  multisigOptions: any

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

  // ----- CREATE ACCOUNT Members

  accountName: any

  transaction: any

  requiresTransaction: boolean

  generateKeysIfNeeded(): Promise<void>
}
