import { MultisigPlugin } from '../../../../interfaces/plugins/multisig'
import { EthereumAddress } from '../../models'

type EthereumMultisigPluginInput = {
  multisigAddress?: EthereumAddress
  createAccountOptions?: any
  transactionOptions?: any
}

export interface EthereumMultisigPlugin extends MultisigPlugin {
  name: string

  init(input: EthereumMultisigPluginInput): Promise<void>

  isInitialized: boolean

  // ----- TRANSACTION Members

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean

  multisigOptions: any

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

  // ----- CREATE ACCOUNT Members

  /** Account named used when creating the account */
  createAccountName: any

  /** Compose the transaction action needed to create the account */
  createAccountTransactionAction: any

  /** If true, an transaction must be sent to chain to create account - use createAccountTransactionAction for action needed */
  createAccountRequiresTransaction: boolean

  createAccountGenerateKeysIfNeeded(): Promise<void>
}
