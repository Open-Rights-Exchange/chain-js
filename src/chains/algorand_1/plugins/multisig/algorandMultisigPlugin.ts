import {
  AlgorandAddress,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandRawTransactionMultisigStruct,
  AlgorandSignature,
  AlgorandTxEncodedForChain,
} from '../../models'
import { MultisigPluginCreateAccount, MultisigPluginTransaction } from '../../../../interfaces/plugins/multisig'
import { ChainJsPlugin, PluginType } from '../../../../interfaces/plugin'

export interface AlgorandMultisigPluginCreateAccount extends MultisigPluginCreateAccount {
  init(input: any): Promise<void>

  options: any

  owners: string[]

  threshold: number

  /** Account named used when creating the account */
  accountName: any

  /** Compose the transaction action needed to create the account */
  transactionAction: any

  /** If true, an transaction must be sent to chain to create account - use transactionAction for action needed */
  requiresTransaction: boolean

  generateKeysIfNeeded(): Promise<void>
}

export interface AlgorandMultisigPluginTransaction extends MultisigPluginTransaction {
  init(options: any): Promise<void>

  options: any

  owners: string[]

  threshold: number

  /** Whether parent transaction has been set yet
   * Always False for Algorand */
  hasParentTransaction: boolean

  /** Whether transaction has been prepared for signing (has raw body) */
  hasRawTransaction: boolean

  /** List of accounts transaction can be signed by - but have not signed yet */
  missingSignatures: AlgorandAddress[]

  /** Parent transaction is what gets sent to chain
   * Always False for Algorand */
  parentRawTransaction: void

  /** Whether transaction has been prepared for signing (has raw body) */
  rawTransaction: AlgorandRawTransactionMultisigStruct

  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: AlgorandAddress[]

  /** Wether multisigPlugin requires transaction body to be wrapped in a parent transaction
   * Always False for Algorand */
  requiresParentTransaction?: boolean

  /** Signatures attached to transaction */
  signatures: AlgorandSignature[]

  getPublicKeysForSignaturesFromRawTx(): AlgorandPublicKey[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: AlgorandSignature[]): void

  prepareToBeSigned(trxEncodedForChain: AlgorandTxEncodedForChain): Promise<void>

  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: AlgorandPrivateKey[]): Promise<void>

  validate(): Promise<void>
}

export interface AlgorandMultisigPlugin extends ChainJsPlugin {
  name: string

  type: PluginType

  init(input: any): Promise<void>

  new: {
    /** Return a new CreateAccount object used to help with creating a new chain account */
    CreateAccount(options?: any): Promise<AlgorandMultisigPluginCreateAccount>
    /** Return a chain Transaction object used to compose and send transactions */
    Transaction(options?: any): Promise<AlgorandMultisigPluginTransaction>
  }
}
