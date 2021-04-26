import { MultisigPlugin } from "../../../interfaces/plugins/multisig";
import { AlgorandTransaction } from "../algoTransaction";
import { AlgorandAddress, AlgorandEntityName, AlgorandPrivateKey, AlgorandPublicKey, AlgorandRawTransactionMultisigStruct, AlgorandSignature, AlgorandTxAction, AlgorandTxActionRaw, AlgorandTxActionSdkEncoded, AlgorandTxEncodedForChain } from "../models";
import { AlgorandMultiSigOptions } from "../models/multisig";

export interface AlgorandMultisigPlugin extends MultisigPlugin {
  /** Transaction's actions */
  multiSigOptions: AlgorandMultiSigOptions
  /** Chain-specific and time-sensitive transaction header */
  multiSigOptionsFromRaw: AlgorandMultiSigOptions
  /** Raw transaction body
   *  Note: Set via prepareToBeSigned() or setFromRaw() */
  rawTransaction: AlgorandRawTransactionMultisigStruct
  /** Whether transaction has been prepared for signing (has raw body) */
  hasRaw: boolean

  missingSignatures: AlgorandAddress[]
  /** An array of the unique set of authorizations needed for all actions in transaction */
  requiredAuthorizations: AlgorandAddress[]
  /** Signatures attached to transaction */
  signatures: AlgorandSignature[]

  assertMultisigFromMatchesOptions(
    action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded | AlgorandRawTransactionMultisigStruct,
  ): void

  getPublicKeysForSignaturesFromRawTx(): AlgorandPublicKey[]

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signature: AlgorandSignature[]): void

  validate(): void

  prepareToBeSigned(trxEncodedForChain: AlgorandTxEncodedForChain): Promise<void>
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