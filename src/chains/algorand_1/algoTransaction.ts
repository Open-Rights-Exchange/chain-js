/* eslint-disable @typescript-eslint/no-unused-vars */
import * as algosdk from 'algosdk'
import { Transaction as AlgoTransactionClass } from 'algosdk/src/transaction'
import { Transaction } from '../../interfaces'
import { ChainErrorType, ConfirmType, TransactionCost, TxExecutionPriority } from '../../models'
import { mapChainError } from './algoErrors'
import { throwNewError } from '../../errors'
import {
  byteArrayToHexString,
  hexStringToByteArray,
  isArrayLengthOne,
  isAString,
  isAUint8Array,
  isNullOrEmpty,
  notImplemented,
  uint8ArraysAreEqual,
} from '../../helpers'
import { AlgorandChainState } from './algoChainState'
import {
  AlgorandAddress,
  AlgorandChainSettingsCommunicationSettings,
  AlgorandChainTransactionParamsStruct,
  AlgorandMultiSigOptions,
  AlgorandMultiSignatureStruct,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandRawTransactionMultisigStruct,
  AlgorandRawTransactionStruct,
  AlgorandSignature,
  AlgorandTransactionOptions,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxActionSdkEncoded,
  AlgorandTxHeaderParams,
  AlgorandTxSignResults,
  AlgorandTransactionResources,
  AlgorandMultiSignatureMsigStruct,
  AlgorandAddressStruct,
} from './models'
import { AlgorandActionHelper } from './algoAction'
import {
  algoToMicro,
  determineMultiSigAddress,
  isValidAlgorandAddress,
  isValidAlgorandSignature,
  getPublicKeyForAddress,
  microToAlgoString,
  toAlgorandAddress,
  toAlgorandAddressFromPublicKeyByteArray,
  toAlgorandAddressFromRawStruct,
  toAlgorandPublicKey,
  toRawAddressBufferFromAlgorandAddress,
  toRawTransactionFromSignResults,
} from './helpers'
import {
  toAlgorandSignatureFromRawSig,
  toPublicKeyFromAddress,
  toAlgorandPrivateKey,
  toAddressFromPublicKey,
  isValidTxSignatureForPublicKey,
  assertValidSignatures,
} from './helpers/cryptoModelHelpers'
import {
  getAlgorandPublicKeyFromPrivateKey,
  verifySignedWithPublicKey as verifySignatureForDataAndPublicKey,
} from './algoCrypto'
import { MINIMUM_TRANSACTION_FEE, TRANSACTION_FEE_PRIORITY_MULTIPLIERS } from './algoConstants'
// eslint-disable-next-line import/no-cycle
import { AlgorandMultisigPlugin } from './plugins/multisigNativePlugin'

export class AlgorandTransaction implements Transaction {
  private _actionHelper: AlgorandActionHelper

  /** Instance of Algorand SDK's Algorand Transaction Class */
  private _algoSdkTransaction: any

  private _chainState: AlgorandChainState

  private _options: AlgorandTransactionOptions

  /** Raw transaction object including signature (if any) */
  private _rawTransaction: AlgorandRawTransactionStruct

  /** Public Key used to sign transaction - set by sign() */
  private _signedByPublicKey: AlgorandPublicKey

  private _isValidated: boolean

  private _multisigPlugin: AlgorandMultisigPlugin

  constructor(chainState: AlgorandChainState, options?: AlgorandTransactionOptions) {
    this._chainState = chainState
    this.assertValidOptions(options)
    this._options = options || {}
    if (options?.multiSigOptions) {
      this._multisigPlugin = new AlgorandMultisigPlugin({ options })
    }
  }

  get multisigPlugin(): AlgorandMultisigPlugin {
    return this._multisigPlugin
  }

  /** Chain-specific values included in the transaction sent to the chain */
  get header(): AlgorandTxHeaderParams {
    return this._actionHelper.transactionHeaderParams
  }

  /** Options provided when the transaction class was created */
  get options() {
    return this._options
  }

  /** Raw tranasction body (prepared for signing) */
  get raw(): AlgorandRawTransactionStruct | AlgorandRawTransactionMultisigStruct {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction has not been prepared to be signed yet. Call prepareToBeSigned() or use setFromRaw(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
    return this.rawTransaction
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRaw(): boolean {
    return !!this.rawTransaction
  }

  /** Generate the raw transaction body using the actions attached
   *  Also adds a header to the transaction that is included when transaction is signed
   */
  public async prepareToBeSigned(): Promise<void> {
    // if we already have a raw transaction, we dont need to recreate another one - and shouldnt assertNoSignatures()
    if (this.hasRaw) {
      return
    }
    this.assertIsConnected()
    this.assertNoSignatures()
    this.assertHasAction()
    const chainTxHeaderParams: AlgorandChainTransactionParamsStruct = (await this._chainState.getChainInfo())
      ?.nativeInfo?.transactionHeaderParams
    this.setAlgoSdkTransactionFromAction() // update _algoSdkTransaction with the latest
    // get a chain-ready minified transaction - uses Algo SDK Transaction class
    const rawTx = this._algoSdkTransaction?.get_obj_for_encoding()
    if (this.isMultiSig) {
      console.log('rawTrx: ', rawTx)
      this.multisigPlugin.prepareMultisigToBeSigned(rawTx)
    } else {
      this._rawTransaction = {
        txn: rawTx,
        sig: undefined,
      }
      // add rekey spending key
      this.addSignerKeyToRawTransactionIfNeeded()
    }
  }

  private addSignerKeyToRawTransactionIfNeeded() {
    // add rekey spending key
    if (this.options.signerPublicKey) {
      this._rawTransaction.sgnr = this.options.signerPublicKey
    }
  }

  /** Set the transaction by using the blob from the results of an Algo SDK sign function
   *  rawTransaction is either encoded as Uint8Array or JSON object of raw transaction
   *  Example format: { txn: {}, sig: {}, sngr: {}, msig: {} }
   */
  async setFromRaw(
    rawTransaction: AlgorandRawTransactionMultisigStruct | AlgorandRawTransactionStruct | Uint8Array,
  ): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    let decodedBlob
    // if transaction isnt already encoded, encode it
    if (isAUint8Array(rawTransaction)) {
      decodedBlob = algosdk.decodeObj(rawTransaction)
    } else {
      decodedBlob = rawTransaction
    }

    if (!decodedBlob?.txn) {
      throwNewError('Cant decode blob into transaction - expected a property .txn')
    }
    this.assertMultisigFromMatchesOptions(decodedBlob)
    // uses ActionHelper to convert packed transaction blob into AlgorandTxActionSdkEncoded (for Algo SDK)
    this.actions = [decodedBlob]
    this.setRawTransactionFromSignResults({ txID: null, blob: algosdk.encodeObj(decodedBlob) })
    this.setAlgoSdkTransactionFromAction() // update _algoSdkTransaction with the data from action
    this._isValidated = false
  }

  /** actionHelper provides different formats of action - Use only to READ data */
  get actionHelper() {
    return this._actionHelper
  }

  // NOTE: this funciton will only return type AlgorandTxAction[] - other types added so that get actions() and set actions() have the same signature (required by Typescript)
  /** Algorand transaction action (transfer & asset related functions)
   */
  public get actions(): (
    | AlgorandTxAction
    | AlgorandTxActionRaw
    | AlgorandTxActionSdkEncoded
    | AlgorandRawTransactionStruct
    | AlgorandRawTransactionMultisigStruct
  )[] {
    const { action } = this
    if (!action) {
      return null
    }
    return [action]
  }

  /** Private property for the Algorand action - uses _actionHelper */
  private get action(): AlgorandTxAction {
    if (!this._actionHelper?.action) return null
    return { ...this._actionHelper?.action }
  }

  /** update the private instance of AlgorandTransaction object using action info */
  public setAlgoSdkTransactionFromAction() {
    if (isNullOrEmpty(this._actionHelper?.actionEncodedForSdk)) {
      this._algoSdkTransaction = null
    } else {
      const chainTxHeaderParams = this._chainState.chainInfo.nativeInfo.transactionHeaderParams
      this._actionHelper.applyCurrentTxHeaderParamsWhereNeeded(chainTxHeaderParams)
      this._algoSdkTransaction = new AlgoTransactionClass(this._actionHelper.actionEncodedForSdk)
    }
  }

  /** Sets actions array
   * Array length has to be exactly 1 because algorand doesn't support multiple actions
   */
  public set actions(
    actions: (
      | AlgorandTxAction
      | AlgorandTxActionRaw
      | AlgorandTxActionSdkEncoded
      | AlgorandRawTransactionStruct
      | AlgorandRawTransactionMultisigStruct
    )[],
  ) {
    this.assertNoSignatures()
    if (isNullOrEmpty(actions)) {
      this._actionHelper = null
      this._algoSdkTransaction = null
      this._isValidated = false
      return
    }
    if (!isArrayLengthOne(actions)) {
      throwNewError('Algorand transaction.actions only accepts an array of exactly 1 action')
    }
    const action = actions[0]
    this._actionHelper = new AlgorandActionHelper(action)
    this.setAlgoSdkTransactionFromAction()
    this._isValidated = false
  }

  /** Add action to the transaction body
   *  throws if transaction.actions already has a value
   *  Ignores asFirstAction parameter since only one action is supported in algorand */
  public addAction(
    action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
    asFirstAction?: boolean,
  ): void {
    this.assertNoSignatures()
    if (!isNullOrEmpty(this._actionHelper)) {
      throwNewError(
        'addAction failed. Transaction already has an action and can only have one. You can use transaction.actions to replace existing action.',
      )
    }
    this.actions = [action]
  }

  // validation

  /** Verifies that raw trx exists
   *  Throws if any problems */
  public async validate(): Promise<void> {
    this.assertHasAction()
    this.assertHasRaw()
    this.assertMultisigFromMatchesOptions(this.actions[0])
    this._isValidated = true
  }

  /** Whether transaction has been validated - via validate() */
  get isValidated() {
    return this._isValidated
  }

  /** Throws if not validated */
  private assertIsValidated(): void {
    this.assertIsConnected()
    this.assertHasRaw()
    if (!this._isValidated) {
      throwNewError('Transaction not validated. Call transaction.validate() first.')
    }
  }

  // signatures

  /** Signatures attached to transaction */
  get signatures(): AlgorandSignature[] {
    // retrieve signatures from raw transaction
    const { rawTransaction } = this
    if (this.isMultiSig) {
      return this.multisigPlugin.signatures
    }
    const signature = (rawTransaction as AlgorandRawTransactionStruct)?.sig
    return signature ? [toAlgorandSignatureFromRawSig(signature)] : null
  }

  /** Sets one or more signatures on the transaction
   * Signatures are hexstring encoded Uint8Array */
  set signatures(signatures: AlgorandSignature[]) {
    this.addSignatures(signatures)
  }

  /** Add signatures to raw transaction
   *  Only allows signatures that use the publicKey(s) required for the transaction (from accnt, rekeyed spending key, or mulisig keys)
   *  Signatures are hexstring encoded Uint8Array */
  addSignatures = (signaturesIn: AlgorandSignature[]): void => {
    const signatures = signaturesIn || []
    this.assertHasRaw()
    assertValidSignatures(signatures)
    let errorMsg: string

    // NOTE: since we dont have the public key for the incoming signature, we check the signature against each of the public keys used for this transaction
    // When we find a match, we use that publicKey for the new signature structure
    if (!this.isMultiSig) {
      if (isNullOrEmpty(signatures)) this._rawTransaction.sig = null
      // Handle non-multisig transaction
      const signature = signatures[0]
      if (this.hasAnySignatures) errorMsg = 'Transaction already has a signature. Cant add more than one signature.'
      if (signatures.length > 1) errorMsg = 'Cant add more than one signature to a non-multisig transaction.'
      // Check that the signature matches the raw transaction body (and signing public key)
      if (!isValidTxSignatureForPublicKey(signature, this.signerPublicKey)) {
        errorMsg = `Signature isnt valid for this transaction using publicKey ${this.signerPublicKey}. If this is a rekeyed account, specify its spending key (via transaction options signerPublicKey) before adding signature`
      }
      this._rawTransaction.sig = Buffer.from(hexStringToByteArray(signature))
    } else {
      this.multisigPlugin.addSignatures(signatures)
    }

    if (errorMsg) {
      throwNewError(errorMsg)
    }
  }

  /** Whether there is an attached signature */
  get hasAnySignatures(): boolean {
    return !isNullOrEmpty(this.signatures)
  }

  /** Throws if any signatures are attached */
  private assertNoSignatures() {
    if (this.hasAnySignatures) {
      throwNewError(
        'You cant modify the body of the transaction without invalidating the existing signatures. Remove the signatures first.',
      )
    }
  }

  /** Throws if an action isn't attached to this transaction */
  private assertHasAction() {
    if (isNullOrEmpty(this._actionHelper)) {
      throwNewError('Transaction has no action. You can set the action using transaction.actions.')
    }
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey(publicKey: AlgorandPublicKey): boolean {
    const pks = this.getPublicKeysForSignaturesFromRawTx() || []
    return !!pks.find(key => key === publicKey)
  }

  /** Returns public keys of the signatures attached to the signed transaction
   *  For a typical transaction, there is only signature, multiSig transactions can have more */
  private getPublicKeysForSignaturesFromRawTx(): AlgorandPublicKey[] {
    let publicKeys: AlgorandPublicKey[]
    if (this.isMultiSig) {
      return this.multisigPlugin.getPublicKeysForSignaturesFromRawTx()
    }
    if (this._rawTransaction.sig) {
      return this.signerPublicKey ? [this.signerPublicKey] : null
    }
    return publicKeys
  }

  /** Whether there is an attached signature for the publicKey of the address */
  public async hasSignatureForAuthorization(address: AlgorandAddress): Promise<boolean> {
    const publicKey = getPublicKeyForAddress(address)
    return this.hasSignatureForPublicKey(publicKey)
  }

  /** Whether signature is attached to transaction (and/or whether the signature is correct) */
  public get hasAllRequiredSignatures(): boolean {
    this.assertIsValidated()
    return isNullOrEmpty(this.missingSignatures)
  }

  /** Returns whether the transaction is a multisig transaction */
  public get isMultiSig(): boolean {
    return !isNullOrEmpty(this.multisigPlugin)
  }

  /** Returns address, for which, a matching signature must be attached to transaction */
  public get missingSignatures(): AlgorandAddress[] {
    this.assertIsValidated()
    // check if number of signatures present are greater then or equal to multisig threshold
    // If threshold reached, return null for missing signatures
    if (this.isMultiSig) {
      return this.multisigPlugin.missingSignatures
    }
    const missingSignatures =
      this.requiredAuthorizations?.filter(auth => !this.hasSignatureForPublicKey(toPublicKeyFromAddress(auth))) || []
    const signaturesAttachedCount = (this.requiredAuthorizations?.length || 0) - missingSignatures.length

    return isNullOrEmpty(missingSignatures) ? null : missingSignatures // if no values, return null instead of empty array
  }

  /** Multisig transaction options */
  private get multiSigOptions(): AlgorandMultiSigOptions {
    return this.isMultiSig ? this.multisigPlugin.multiSigOptions : null
  }

  /** Get the raw transaction (either regular or multisig) */
  get rawTransaction(): AlgorandRawTransactionStruct | AlgorandRawTransactionMultisigStruct {
    let rawTransaction
    if (this.isMultiSig) {
      rawTransaction = this.multisigPlugin.rawMultisigTransaction
    } else {
      rawTransaction = this._rawTransaction
    }
    return rawTransaction
  }

  /** Determine standard multisig options from raw msig struct */
  private multisigOptionsFromRawTransactionMultisig(msig: AlgorandMultiSignatureMsigStruct): AlgorandMultiSigOptions {
    if (isNullOrEmpty(msig)) return null
    const addrs = msig.subsig.map(sig => toAddressFromPublicKey(toAlgorandPublicKey(byteArrayToHexString(sig.pk))))
    return {
      version: msig.v,
      threshold: msig.thr,
      addrs,
    }
  }

  /** Public Key of account that has signed (or will sign) this transaction (for non-multisig)
   *  Usually the same as the from address's PK - unless the account has been rekeyed in which case this is the rekeyed PK
   *  If sign() function is used, this value will be set automatically
   *  If using addSignature() for a rekeyed account, this value must be set in transaction options */
  private get signerPublicKey(): AlgorandPublicKey {
    // if transaction has been signed via sign(), we'll return that (_signedByPublicKey)
    if (this._signedByPublicKey) return this._signedByPublicKey
    // Or if the option.signerPublicKey was specified, we'll return that (used to specify a key for rekeyed accounts)
    if (this.options.signerPublicKey) return this.options.signerPublicKey
    // Otherwise, we'll assume its the publickey of the from address
    return this.action.from ? toPublicKeyFromAddress(this.action.from) : null
  }

  /** Returns array of the required addresses for a transaction/multisig transaction
   *  Returns the from address in the action or addresses from multisig options for multisig transaction
   */
  public get requiredAuthorizations(): AlgorandAddress[] {
    this.assertIsValidated()
    this.assertFromIsValidAddress()
    if (this.isMultiSig) {
      return this?.multiSigOptions?.addrs || []
    }
    // The signerPublicKey is usually based on the from address (or the spending key for a rekeyed account)
    return this.signerPublicKey ? [toAddressFromPublicKey(this.signerPublicKey)] : []
  }

  public get signBuffer(): Buffer {
    return notImplemented()
  }

  /** Algorand provides the functionality to sign a transaction using multi-signature account */
  public get supportsMultisigTransaction(): boolean {
    return true
  }

  /** Hexstring encoded hash of txn + tag (if any) - generated by Algo SDK Transaction object */
  public get transactionId(): string {
    return this._algoSdkTransaction?.txID().toString()
  }

  /** Sign the transaction body with private key and add to attached signatures */
  public async sign(privateKeys: AlgorandPrivateKey[]): Promise<void> {
    let transactionId: string
    this.assertIsValidated()
    if (this.isMultiSig) {
      this.multisigPlugin.signMultisig(privateKeys, this.transactionId)
    } else {
      const privateKey = hexStringToByteArray(privateKeys[0])
      const signResults: AlgorandTxSignResults = algosdk.signTransaction(
        this._actionHelper.actionEncodedForSdk,
        privateKey,
      )
      this.setRawTransactionFromSignResults(signResults)
      // the signer is the publicKey associated with the privateKey
      this._signedByPublicKey = getAlgorandPublicKeyFromPrivateKey(
        toAlgorandPrivateKey(byteArrayToHexString(privateKey)),
      )
    }
  }

  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block before returning */
  public send(
    waitForConfirm: ConfirmType = ConfirmType.None,
    communicationSettings?: AlgorandChainSettingsCommunicationSettings,
  ): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    const signedTransaction = byteArrayToHexString(new Uint8Array(algosdk.encodeObj(this.rawTransaction)))
    return this._chainState.sendTransaction(signedTransaction, waitForConfirm, communicationSettings)
  }

  // helpers

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    // If a specific action.from is specifed, ensure that a signature is attached that matches its address/public key
    if (!this.hasAllRequiredSignatures) {
      throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRaw) {
      throwNewError('Transaction doesnt have a raw transaction body. Call prepareToBeSigned() or use setFromRaw().')
    }
  }

  /** Whether action.from is a valid address (and not null or empty) */
  private isFromAValidAddress(): boolean {
    return isValidAlgorandAddress(this?.action?.from)
  }

  /** Throws if from is not null or empty algorand argument */
  private assertFromIsValidAddress(): void {
    if (!this.isFromAValidAddress()) {
      throwNewError('Transaction action[].from is not a valid address.')
    }
  }

  /** Throws if from is not null or empty algorand argument */
  private assertValidOptions(options: AlgorandTransactionOptions): void {
    if (options?.multiSigOptions && options?.signerPublicKey) {
      throwNewError(
        'Invalid transaction options: Provide multiSigOptions OR signerPublicKey - not both. The signerPublicKey is for non-multisig transasctions only',
      )
    }
  }

  /** extract 'from' address from various action types and confirm it matches multisig options */
  private assertMultisigFromMatchesOptions(
    action?:
    | AlgorandTxAction
    | AlgorandTxActionRaw
    | AlgorandTxActionSdkEncoded
    | AlgorandRawTransactionStruct
    | AlgorandRawTransactionMultisigStruct,
  ): AlgorandAddress {
    let fromAddr: AlgorandAddress
    const txAction = action as AlgorandTxAction | AlgorandTxActionSdkEncoded
    const txRaw = action as AlgorandTxActionRaw
    const txRawStruct = action as AlgorandRawTransactionStruct
    const txRawStructMultisig = action as AlgorandRawTransactionMultisigStruct // has .msig
    const multiSigOptionsFromRaw = !isNullOrEmpty(txRawStructMultisig?.msig)
      ? this.multisigOptionsFromRawTransactionMultisig(txRawStructMultisig.msig)
      : null
    const multiSigOptions = this.multiSigOptions || multiSigOptionsFromRaw
    // if not multisig, we're done here
    if (isNullOrEmpty(multiSigOptions)) return

    const multiSigFrom: AlgorandAddress = determineMultiSigAddress(multiSigOptions)

    // extract fromAddr from various action types
    if (!isNullOrEmpty(txRawStruct?.txn)) {
      fromAddr = toAlgorandAddressFromPublicKeyByteArray(txRawStruct.txn?.snd) // AlgorandRawTransactionStruct and AlgorandRawTransactionMultisigStruct
    } else if (isAString(txAction.from)) {
      fromAddr = toAlgorandAddress(txAction.from) // AlgorandTxAction and AlgorandTxActionSdkEncoded
    } else {
      fromAddr = toAlgorandAddressFromRawStruct(txRaw.from) // AlgorandTxActionRaw
    }

    if (fromAddr !== multiSigFrom) {
      throwNewError(
        `From address (or txn.snd) must be the multisig address (hash of multisig options). Got: ${fromAddr}. Expected: ${multiSigFrom}`,
      )
    }
  }

  /** Set the raw trasaction properties from the packed results from using Algo SDK to sign tx */
  private setRawTransactionFromSignResults(signResults: AlgorandTxSignResults) {
    const { transaction } = toRawTransactionFromSignResults(signResults)
    if ((transaction as AlgorandRawTransactionMultisigStruct)?.msig) {
      this._multisigPlugin = new AlgorandMultisigPlugin({ raw: transaction as AlgorandRawTransactionMultisigStruct })
    } else {
      this._rawTransaction = transaction as AlgorandRawTransactionStruct
    }
  }

  /** JSON representation of transaction data */
  public toJson(): any {
    return { header: this.header, actions: this.actions, raw: this.raw, signatures: this.signatures }
  }

  // Fees

  public get supportsFee() {
    return true
  }

  /** Returns Algorand specific transaction resource unit (bytes) */
  public async resourcesRequired(): Promise<AlgorandTransactionResources> {
    const bytes = await this._algoSdkTransaction?.estimateSize()
    return { bytes }
  }

  /** Sets transaction fee propert as flatfee
   *  desiredFee units is in algos (expressed as a string)
   */
  public async setDesiredFee(desiredFee: string) {
    const fee = algoToMicro(desiredFee)
    const trx: AlgorandTxAction = { ...this._actionHelper.action, fee, flatFee: true }
    this.actions = [trx]
  }

  /** Returns transaction fee in units of microalgos (expressed as a string) */
  public async getSuggestedFee(priority: TxExecutionPriority): Promise<string> {
    const { bytes } = await this.resourcesRequired()
    const suggestedFeePerByte = await this._chainState.getSuggestedFeePerByte()
    const microalgos = bytes * suggestedFeePerByte * TRANSACTION_FEE_PRIORITY_MULTIPLIERS[priority]
    return microToAlgoString(microalgos)
  }

  /** Returns the actual cost of executing the transaction in units of Algos (expressed as a string)
   * Throws if transaction not found on-chain */
  public async getActualCost(): Promise<string> {
    try {
      const trx = await this._chainState.getTransactionById(this.transactionId)
      return trx ? microToAlgoString(trx?.fee) : null
    } catch (error) {
      const chainError = mapChainError(error)
      if (chainError?.errorType === ChainErrorType.TxNotFoundOnChain) {
        throw new Error('Cant retrieve actual cost - Transaction not found on chain')
      } else {
        throw error
      }
    }
  }
}
