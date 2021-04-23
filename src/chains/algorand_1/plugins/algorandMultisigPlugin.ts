import { MultisigPlugin } from "../../../interfaces/plugins/multisig";
import { AlgorandTransaction } from "../algoTransaction";
import { AlgorandEntityName, AlgorandPrivateKey, AlgorandPublicKey, AlgorandRawTransactionMultisigStruct, AlgorandSignature, AlgorandTxAction, AlgorandTxActionRaw, AlgorandTxActionSdkEncoded } from "../models";

export interface AlgorandMultisigPlugin extends MultisigPlugin {
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

  accountName: AlgorandEntityName

  transaction: AlgorandTransaction

  generateKeysIfNeeded(): Promise<void>
}