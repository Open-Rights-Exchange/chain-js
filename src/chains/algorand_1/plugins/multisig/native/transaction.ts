import * as algosdk from 'algosdk'
import { Transaction as AlgoTransactionClass } from 'algosdk'
import { byteArrayToHexString, hexStringToByteArray, isNullOrEmpty, uint8ArraysAreEqual } from '../../../../../helpers'
import {
  AlgorandAddress,
  AlgorandMultiSignatureMsigStruct,
  AlgorandMultiSignatureStruct,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandRawTransactionMultisigStruct,
  AlgorandSignature,
  AlgorandTxSignResults,
  AlgorandTxEncodedForChain,
} from '../../../models'
import { getAlgorandPublicKeyFromPrivateKey, verifySignedWithPublicKey } from '../../../algoCrypto'
import {
  assertValidSignatures,
  getPublicKeyForAddress,
  toAddressFromPublicKey,
  toAlgorandAddressFromPublicKeyByteArray,
  toAlgorandPublicKey,
  toAlgorandSignatureFromRawSig,
  toPublicKeyFromAddress,
  toRawTransactionFromSignResults,
} from '../../../helpers'
import { throwNewError } from '../../../../../errors'
import { AlgorandMultisigPluginTransaction } from '../algorandMultisigPlugin'
import { AlgorandActionHelper } from '../../../algoAction'
import { AlgorandNativeTransactionOptions, AlgorandNativeCreateAccountOptions } from './models'
import { determineMultiSigAddress } from './helpers'

export class NativeMultisigPluginTransaction implements AlgorandMultisigPluginTransaction {
  private _options: AlgorandNativeTransactionOptions

  private _multisigAddress: AlgorandAddress

  private _rawTransaction: AlgorandRawTransactionMultisigStruct

  private _actionHelper: AlgorandActionHelper

  constructor(options: AlgorandNativeTransactionOptions) {
    this._options = options
  }

  async init() {
    const { multisigOptions, rawTransaction } = this.options
    if (!isNullOrEmpty(rawTransaction)) {
      this._options.multisigOptions = this.verifyAndGetMultisigOptionsFromRaw(rawTransaction)
      this.setRawTransactionFromSignResults({ txID: null, blob: algosdk.encodeObj(rawTransaction) })
      this._actionHelper = new AlgorandActionHelper(rawTransaction)
    } else {
      this._multisigAddress = determineMultiSigAddress(multisigOptions)
    }
  }

  get multisigAddress(): AlgorandAddress {
    return this._multisigAddress
  }

  get options(): AlgorandNativeTransactionOptions {
    return this._options
  }

  get owners(): string[] {
    return this.options?.multisigOptions?.addrs
  }

  get threshold(): number {
    return this.options?.multisigOptions?.threshold
  }

  get version(): number {
    return this.options?.multisigOptions?.version
  }

  /** Get the raw transaction (either regular or multisig) */
  get rawTransaction(): AlgorandRawTransactionMultisigStruct {
    return this._rawTransaction
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRaw(): boolean {
    return !!this.rawTransaction
  }

  get algoSdkTransaction() {
    return new AlgoTransactionClass(this._actionHelper.actionEncodedForSdk)
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRaw) {
      throwNewError('Transaction doesnt have a raw transaction body. Call prepareToBeSigned() or use setFromRaw().')
    }
  }

  public validate(): Promise<void> {
    this.verifyAndGetMultisigOptionsFromRaw(this.rawTransaction)
    return null
  }

  /** Generate the raw transaction body using the actions attached
   *  Also adds a header to the transaction that is included when transaction is signed
   */
  public async prepareToBeSigned(rawTransaction: AlgorandTxEncodedForChain): Promise<void> {
    let msig
    if (!isNullOrEmpty(this.options?.multisigOptions)) {
      msig = {
        v: this.version,
        thr: this.threshold,
        subsig: this.owners?.map(addr => ({
          pk: Buffer.from(hexStringToByteArray(toPublicKeyFromAddress(addr))),
        })),
      }
    }
    this._rawTransaction = {
      txn: rawTransaction,
      msig,
    }
    this._actionHelper = new AlgorandActionHelper(this._rawTransaction)
  }

  /** Determine standard multisig options from raw msig struct */
  private multisigOptionsFromRawTransactionMultisig(
    msig: AlgorandMultiSignatureMsigStruct,
  ): AlgorandNativeCreateAccountOptions {
    if (isNullOrEmpty(msig)) return null
    const addrs = msig.subsig?.map(sig => toAddressFromPublicKey(toAlgorandPublicKey(byteArrayToHexString(sig.pk))))
    return {
      version: msig?.v,
      threshold: msig?.thr,
      addrs,
    }
  }

  /** Signatures attached to transaction */
  get signatures(): AlgorandSignature[] {
    const signatures = (this.rawTransaction as AlgorandRawTransactionMultisigStruct)?.msig?.subsig
      ?.filter(subsig => !!subsig.s)
      ?.map(subsig => toAlgorandSignatureFromRawSig(subsig.s))

    return signatures || null
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey(publicKey: AlgorandPublicKey): boolean {
    const pks = this.getPublicKeysForSignaturesFromRawTx() || []
    return !!pks.find(key => key === publicKey)
  }

  /** Returns address, for which, a matching signature must be attached to transaction */
  public get missingSignatures(): AlgorandAddress[] {
    const missingSignatures =
      this.requiredAuthorizations?.filter(auth => !this.hasSignatureForPublicKey(toPublicKeyFromAddress(auth))) || []
    const signaturesAttachedCount = (this.requiredAuthorizations?.length || 0) - missingSignatures.length

    // check if number of signatures present are greater then or equal to multisig threshold
    // If threshold reached, return null for missing signatures
    return signaturesAttachedCount >= this.threshold ? null : missingSignatures
  }

  /** Returns public keys of the signatures attached to the signed transaction
   *  For a typical transaction, there is only signature, multisig transactions can have more */
  public getPublicKeysForSignaturesFromRawTx(): AlgorandPublicKey[] {
    const { msig } = this._rawTransaction
    // drop empty values in subsig
    const multisigs = msig?.subsig?.filter((sig: AlgorandMultiSignatureStruct) => !!sig?.s) || []
    return multisigs?.map((sig: AlgorandMultiSignatureStruct) => toAlgorandPublicKey(byteArrayToHexString(sig.pk)))
  }

  /** Whether the transaction signature is valid for this transaction body and publicKey provided */
  private isValidTxSignatureForPublicKey(signature: AlgorandSignature, publicKey: AlgorandPublicKey): boolean {
    if (!this.rawTransaction) return false
    const transactionBytesToSign = this.algoSdkTransaction?.bytesToSign() // using Algo SDK Transaction object
    return verifySignedWithPublicKey(byteArrayToHexString(transactionBytesToSign), publicKey, signature)
  }

  /** Add signatures to raw transaction
   *  Only allows signatures that use the publicKey(s) required for the transaction (from accnt, rekeyed spending key, or mulisig keys)
   *  Signatures are hexstring encoded Uint8Array */
  addSignatures = (signaturesIn: AlgorandSignature[]): void => {
    const signatures = signaturesIn || []
    this.assertHasRaw()
    assertValidSignatures(signatures)
    // Handle multisig transaction
    if (isNullOrEmpty(signatures) && this?._rawTransaction?.msig) {
      // wipe out all the signatures in the subsig array (just set the public key)
      this._rawTransaction.msig.subsig = this._rawTransaction.msig.subsig.map((ss: any) => ({
        pk: ss.pk,
      }))
    }
    // For every signature provided...
    signatures.forEach(sig => {
      // look for a match with any of the publicKeys in the multisigOptions
      const addressForSig = this.owners.find(addr =>
        this.isValidTxSignatureForPublicKey(sig, getPublicKeyForAddress(addr)),
      )
      if (addressForSig) {
        const newPubKey = hexStringToByteArray(getPublicKeyForAddress(addressForSig))
        const newSig = hexStringToByteArray(sig)
        // set signature for publickey in subsig array
        this._rawTransaction.msig.subsig.find((ss: any) => uint8ArraysAreEqual(ss.pk, newPubKey)).s = newSig
      } else {
        const errorMsg = `The signature: ${sig} isnt valid for this transaction using any of publicKeys specified in multisigOptions: ${JSON.stringify(
          this.options.multisigOptions,
        )}.`
        throwNewError(errorMsg)
      }
    })
  }

  /** Returns array of the required addresses for a transaction/multisig transaction
   *  Returns the from address in the action or addresses from multisig options for multisig transaction
   */
  public get requiredAuthorizations(): AlgorandAddress[] {
    return this.owners || []
  }

  /** Set the raw trasaction properties from the packed results from using Algo SDK to sign tx */
  public setRawTransactionFromSignResults(signResults: AlgorandTxSignResults) {
    const { transaction } = toRawTransactionFromSignResults(signResults)
    this._rawTransaction = transaction as AlgorandRawTransactionMultisigStruct
  }

  /** Hexstring encoded hash of txn + tag (if any) - generated by Algo SDK Transaction object */
  public get transactionId(): string {
    return this.algoSdkTransaction?.txID().toString()
  }

  async sign(privateKeys: AlgorandPrivateKey[]) {
    let signedMergedTransaction: AlgorandTxSignResults
    const signedTransactionResults: AlgorandTxSignResults[] = []
    // start with existing multisig transaction/signatures (if any)
    if (!isNullOrEmpty(this.signatures)) {
      signedTransactionResults.push({
        txID: this.transactionId,
        blob: algosdk.encodeObj(this.rawTransaction),
      })
    }
    // add signatures for each private key provided
    privateKeys.forEach(key => {
      const privateKey = hexStringToByteArray(key)
      const privateKeyAddress = toAddressFromPublicKey(getAlgorandPublicKeyFromPrivateKey(key))
      if (!this.owners.includes(privateKeyAddress)) {
        throwNewError(
          `Cant sign multisig transaction the private key of address ${privateKeyAddress} - it doesnt match an address in multisig options: ${this.owners}`,
        )
      }

      const signResults: AlgorandTxSignResults = algosdk.signMultisigTransaction(
        this._actionHelper.actionEncodedForSdk,
        this.options?.multisigOptions,
        privateKey,
      )
      signedTransactionResults.push(signResults)
    })
    // if more than one sig, use the sdk's merge function
    if (signedTransactionResults.length > 1) {
      const { txID } = signedTransactionResults[0] // txID should be the same for all results
      const blob = algosdk.mergeMultisigTransactions(signedTransactionResults.map(r => r.blob))
      signedMergedTransaction = { txID, blob }
    } else {
      // eslint-disable-next-line prefer-destructuring
      signedMergedTransaction = signedTransactionResults[0]
    }
    // set results to class
    this.setRawTransactionFromSignResults(signedMergedTransaction)
  }

  /** extract 'from' address from various action types and confirm it matches multisig options */
  public verifyAndGetMultisigOptionsFromRaw(
    rawTransaction?: AlgorandRawTransactionMultisigStruct,
  ): AlgorandNativeCreateAccountOptions {
    const multisigOptions = !isNullOrEmpty(rawTransaction?.msig)
      ? this.multisigOptionsFromRawTransactionMultisig(rawTransaction.msig)
      : null

    if (isNullOrEmpty(multisigOptions)) {
      return null
    }

    const multisigFrom: AlgorandAddress = determineMultiSigAddress(multisigOptions)

    this._multisigAddress = multisigFrom

    const fromAddr = toAlgorandAddressFromPublicKeyByteArray(rawTransaction.txn?.snd) // AlgorandRawTransactionMultisigStruct

    if (fromAddr !== multisigFrom) {
      throwNewError(
        `From address (or txn.snd) must be the multisig address (hash of multisig options). Got: ${fromAddr}. Expected: ${multisigFrom}`,
      )
    }
    return multisigOptions
  }
}
