import { MultisigCreateAccount } from '../../../../interfaces/multisigPlugin/multisigCreateAccount'
import { MultisigTransaction } from '../../../../interfaces/multisigPlugin/multisigTransaction'
// eslint-disable-next-line import/no-cycle
import {
  AlgorandAddress,
  AlgorandEntityName,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandRawTransactionMultisigStruct,
  AlgorandSignature,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxActionSdkEncoded,
} from '../../models'

export interface AlgorandMultisigTransaction extends MultisigTransaction {
  /** Transaction's actions */
  multiSigOptions: any
  /** Chain-specific and time-sensitive transaction header */
  multiSigOptionsFromRaw: any
  /** Raw transaction body
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: any
  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean

  missingSignatures: any[]
  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: any[]
  /** Signatures attached to transaction */
  signatures: AlgorandSignature[]

  assertMultisigFromMatchesOptions(
    action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded | AlgorandRawTransactionMultisigStruct,
  ): void

  getPublicKeysForSignaturesFromRawTx(): AlgorandPublicKey[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: AlgorandSignature[]): void

  validate(): void

  prepareToBeSigned(rawTransaction: AlgorandRawTransactionMultisigStruct): Promise<void>
  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(
    actionEncodedForSdk: AlgorandTxActionSdkEncoded,
    privateKeys: AlgorandPrivateKey[],
    transactionId: string,
  ): Promise<void>
}

export interface AlgorandMultisigCreateAccount extends MultisigCreateAccount {
  accountName: AlgorandEntityName

  transaction: MultisigTransaction

  generateKeysIfNeeded(): Promise<void>
}

export interface AlgorandMultisigPlugin {
  transaction: AlgorandMultisigTransaction
  createAccount: AlgorandMultisigCreateAccount
}

export interface AlgorandMultisigPluginInput {
  multiSigOptions?: AlgorandMultiSigOptions
  raw?: AlgorandRawTransactionMultisigStruct
}

export enum AlgorandMultisigPluginType {
  Native = 'native',
}

/**  Multisig options required to create a multisignature account for Algorand */
export type AlgorandMultiSigOptions = {
  version: number
  threshold: number
  addrs: AlgorandAddress[]
  pluginType?: AlgorandMultisigPluginType
}
