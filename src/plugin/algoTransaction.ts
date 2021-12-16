/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as algosdk from 'algosdk'
import { Transaction as AlgoTransactionClass, TransactionLike } from 'algosdk'
// import { Transaction } from '../../interfaces'
// import { ChainErrorType, ChainSettingsCommunicationSettings, ConfirmType, TxExecutionPriority } from '../../models'
import {
  Models,
  ChainFactory,
  Helpers,
  Chain,
  ChainJsPlugin,
  Crypto,
  Errors,
  Interfaces,
} from '@open-rights-exchange/chainjs'
import { mapChainError } from './algoErrors'
// import { throwNewError } from '../../errors'
// import {
//   byteArrayToHexString,
//   hexStringToByteArray,
//   isArrayLengthOne,
//   isAString,
//   isAUint8Array,
//   isNullOrEmpty,
//   notSupported,
//   uint8ArraysAreEqual,
// } from '../../helpers'
import { AlgorandChainState } from './algoChainState'
import {
  AlgorandAddress,
  AlgorandMultisigOptions,
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
  toRawTransactionFromSignResults,
} from './helpers'
import {
  toAddressFromPublicKey,
  toAlgorandPrivateKey,
  toAlgorandSignature,
  toAlgorandSignatureFromRawSig,
  toPublicKeyFromAddress,
} from './helpers/cryptoModelHelpers'
import {
  getAlgorandPublicKeyFromPrivateKey,
  verifySignedWithPublicKey as verifySignatureForDataAndPublicKey,
} from './algoCrypto'
import { MINIMUM_TRANSACTION_FEE_FALLBACK, TRANSACTION_FEE_PRIORITY_MULTIPLIERS } from './algoConstants'

export class AlgorandTransaction implements Interfaces.Transaction {
  private _actionHelper: AlgorandActionHelper

  /** Instance of Algorand SDK's Algorand Transaction Class */
  private _algoSdkTransaction: any

  private _chainState: AlgorandChainState

  private _options: AlgorandTransactionOptions

  /** Raw transaction object including signature (if any) */
  private _rawTransaction: AlgorandRawTransactionStruct

  /** Raw multisig transaction object including signature(s) (if any) */
  private _rawTransactionMultisig: AlgorandRawTransactionMultisigStruct

  /** Public Key used to sign transaction - set by sign() */
  private _signedByPublicKey: AlgorandPublicKey

  private _isValidated: boolean

  constructor(chainState: AlgorandChainState, options?: AlgorandTransactionOptions) {
    this._chainState = chainState
    this.assertValidOptions(options)
    this.applyOptions(options)
  }

  public async init() {
    // Nothing to do
  }

  /** Returns a parent transaction - not used for Algorand */
  get parentTransaction() {
    return Helpers.notSupported(
      'Algorand doesnt use parent transaction- check requiresParentTransaction() before calling this',
    )
  }

  /** Whether parent transaction has been set yet - not used for Algorand */
  public get hasParentTransaction(): boolean {
    return false // Currently always false for algorand (multisig doesnt require it)
  }

  /** Wether multisigPlugin requires transaction body to be wrapped in a parent transaction - not used for Algorand */
  public get requiresParentTransaction(): boolean {
    return false // Currently always false for algorand (multisig doesnt require it)
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
      Errors.throwNewError(
        'Transaction has not been prepared to be signed yet. Call prepareToBeSigned() or use setTransaction(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
    return this.rawTransaction
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRaw(): boolean {
    return !!(this.rawTransaction || this._rawTransactionMultisig)
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
    this.setAlgoSdkTransactionFromAction() // update _algoSdkTransaction with the latest
    // get a chain-ready minified transaction - uses Algo SDK Transaction class
    const rawTx = this._algoSdkTransaction?.get_obj_for_encoding()
    if (this.isMultisig) {
      this._rawTransactionMultisig = {
        txn: rawTx,
        msig: {
          v: this.multiSigOptions.version,
          thr: this.multiSigOptions.threshold,
          subsig: this.multiSigOptions.addrs.map(addr => ({
            pk: Buffer.from(Helpers.hexStringToByteArray(toPublicKeyFromAddress(addr))),
          })),
        },
      }
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

  /** Set the transaction by using any one of many valid formats
   * Valid formats for transaction param include:
   *  JSON with verbose key names and string values (or values encoded by AlgoSDK)
   *  the blob from the results of an Algo SDK sign function
   *  Supports either encoded as Uint8Array or JSON object of raw transaction
   *  Example format: { txn: {}, sig: {}, sngr: {}, msig: {} }
   */
  async setTransaction(
    transaction:
      | AlgorandTxAction
      | AlgorandTxActionRaw
      | AlgorandTxActionSdkEncoded
      | AlgorandRawTransactionStruct
      | AlgorandRawTransactionMultisigStruct
      | Uint8Array,
  ): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    const decodedTransaction = Helpers.isAUint8Array(transaction)
      ? (algosdk.decodeObj(transaction as any) as any)
      : transaction
    // if we have a txn property, then we have a 'raw' tx value, so set raw props
    if (decodedTransaction?.txn) {
      this.setRawTransactionFromSignResults({
        txID: null,
        blob: algosdk.encodeObj(decodedTransaction),
      })
    }
    // actions setter can handle any flavor of transaction
    this.actions = [decodedTransaction]
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
    if (Helpers.isNullOrEmpty(this._actionHelper?.actionEncodedForSdk)) {
      this._algoSdkTransaction = null
    } else {
      const chainTxHeaderParams = this._chainState.chainInfo.nativeInfo.transactionHeaderParams
      this._actionHelper.applyCurrentTxHeaderParamsWhereNeeded(chainTxHeaderParams, this.options)
      this._algoSdkTransaction = new AlgoTransactionClass(this._actionHelper.actionEncodedForSdk as any)
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
    if (Helpers.isNullOrEmpty(actions)) {
      this._actionHelper = null
      this._algoSdkTransaction = null
      this._isValidated = false
      return
    }
    if (!Helpers.isArrayLengthOne(actions)) {
      Errors.throwNewError('Algorand transaction.actions only accepts an array of exactly 1 action')
    }
    const action = actions[0]
    this.assertMultisigFromMatchesOptions(action)
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
    if (!Helpers.isNullOrEmpty(this._actionHelper)) {
      Errors.throwNewError(
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
    if (this.isMultisig) {
      this.assertMultisigFromMatchesOptions(this.actions[0])
    }
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
      Errors.throwNewError('Transaction not validated. Call transaction.validate() first.')
    }
  }

  // signatures

  /** Signatures attached to transaction */
  get signatures(): AlgorandSignature[] {
    // retrieve signatures from raw transaction
    let signatures: AlgorandSignature[]
    const { rawTransaction } = this
    if (this.isMultisig) {
      signatures = (rawTransaction as AlgorandRawTransactionMultisigStruct)?.msig?.subsig
        ?.filter(subsig => !!subsig.s)
        ?.map(subsig => toAlgorandSignatureFromRawSig(subsig.s))
    } else {
      const signature = (rawTransaction as AlgorandRawTransactionStruct)?.sig
      signatures = signature ? [toAlgorandSignatureFromRawSig(signature)] : null
    }

    return signatures || null
  }

  /** Add signatures to raw transaction
   *  Only allows signatures that use the publicKey(s) required for the transaction (from accnt, rekeyed spending key, or mulisig keys)
   *  Signatures are hexstring encoded Uint8Array */
  addSignatures = async (signaturesIn: AlgorandSignature[]): Promise<void> => {
    const signatures = signaturesIn || []
    this.assertHasRaw()
    this.assertValidSignatures(signatures)
    let errorMsg: string

    // NOTE: since we dont have the public key for the incoming signature, we check the signature against each of the public keys used for this transaction
    // When we find a match, we use that publicKey for the new signature structure
    if (!this.isMultisig) {
      if (Helpers.isNullOrEmpty(signatures)) this._rawTransaction.sig = null
      // Handle non-multisig transaction
      const signature = signatures[0]
      if (this.hasAnySignatures) errorMsg = 'Transaction already has a signature. Cant add more than one signature.'
      if (signatures.length > 1) errorMsg = 'Cant add more than one signature to a non-multisig transaction.'
      // Check that the signature matches the raw transaction body (and signing public key)
      if (!this.isValidTxSignatureForPublicKey(signature, this.signerPublicKey)) {
        errorMsg = `Signature isnt valid for this transaction using publicKey ${this.signerPublicKey}. If this is a rekeyed account, specify its spending key (via transaction options signerPublicKey) before adding signature`
      }
      this._rawTransaction.sig = Buffer.from(Helpers.hexStringToByteArray(signature))
    } else {
      // Handle multisig transaction
      if (Helpers.isNullOrEmpty(signatures) && this?._rawTransactionMultisig?.msig) {
        // wipe out all the signatures in the subsig array (just set the public key)
        this._rawTransactionMultisig.msig.subsig = this._rawTransactionMultisig.msig.subsig.map(ss => ({ pk: ss.pk }))
      }
      // For every signature provided...
      signatures.forEach(sig => {
        // look for a match with any of the publicKeys in the multiSigOptions
        const addressForSig = this.multiSigOptions.addrs.find(addr =>
          this.isValidTxSignatureForPublicKey(sig, getPublicKeyForAddress(addr)),
        )
        if (addressForSig) {
          const newPubKey = Helpers.hexStringToByteArray(getPublicKeyForAddress(addressForSig))
          const newSig = Helpers.hexStringToByteArray(sig)
          // set signature for publickey in subsig array
          this._rawTransactionMultisig.msig.subsig.find(ss => Helpers.uint8ArraysAreEqual(ss.pk, newPubKey)).s = newSig
        } else {
          errorMsg = `The signature: ${sig} isnt valid for this transaction using any of publicKeys specified in multiSigOptions: ${JSON.stringify(
            this.multiSigOptions,
          )}.`
          Errors.throwNewError(errorMsg)
        }
      })
    }

    if (errorMsg) {
      Errors.throwNewError(errorMsg)
    }
  }

  /** Throws if signatures isn't properly formatted */
  private assertValidSignatures = (signatures: AlgorandSignature[]) => {
    ;(signatures || []).forEach(sig => {
      if (!isValidAlgorandSignature(sig)) {
        Errors.throwNewError(`Not a valid signature : ${sig}`, 'signature_invalid')
      }
    })
  }

  /** Whether there is an attached signature */
  get hasAnySignatures(): boolean {
    return !Helpers.isNullOrEmpty(this.signatures)
  }

  /** Throws if any signatures are attached */
  private assertNoSignatures() {
    if (this.hasAnySignatures) {
      Errors.throwNewError(
        'You cant modify the body of the transaction without invalidating the existing signatures. Remove the signatures first.',
      )
    }
  }

  /** Throws if an action isn't attached to this transaction */
  private assertHasAction() {
    if (Helpers.isNullOrEmpty(this._actionHelper)) {
      Errors.throwNewError('Transaction has no action. You can set the action using transaction.actions.')
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
    if (this.isMultisig) {
      const { msig } = this._rawTransactionMultisig
      // drop empty values in subsig
      const multiSigs = msig?.subsig?.filter((sig: AlgorandMultiSignatureStruct) => !!sig?.s) || []
      publicKeys = multiSigs?.map((sig: AlgorandMultiSignatureStruct) =>
        toAlgorandPublicKey(Helpers.byteArrayToHexString(sig.pk)),
      )
    } else if (this._rawTransaction.sig) {
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
    return Helpers.isNullOrEmpty(this.missingSignatures)
  }

  /** Returns whether the transaction is a multisig transaction */
  public get isMultisig(): boolean {
    return !Helpers.isNullOrEmpty(this.multiSigOptions)
  }

  /** Returns address, for which, a matching signature must be attached to transaction */
  public get missingSignatures(): AlgorandAddress[] {
    this.assertIsValidated()
    const missingSignatures =
      this.requiredAuthorizations?.filter(auth => !this.hasSignatureForPublicKey(toPublicKeyFromAddress(auth))) || []
    const signaturesAttachedCount = (this.requiredAuthorizations?.length || 0) - missingSignatures.length

    // check if number of signatures present are greater then or equal to multisig threshold
    // If threshold reached, return null for missing signatures
    if (this.isMultisig) {
      return signaturesAttachedCount >= this.multiSigOptions.threshold ? null : missingSignatures
    }

    return Helpers.isNullOrEmpty(missingSignatures) ? null : missingSignatures // if no values, return null instead of empty array
  }

  /** Multisig transaction options */
  private get multiSigOptions(): AlgorandMultisigOptions {
    if (!Helpers.isNullOrEmpty(this._rawTransactionMultisig)) {
      return this.multisigOptionsFromRawTransactionMultisig(this._rawTransactionMultisig.msig)
    }
    return this._options?.multisigOptions
  }

  /** Get the raw transaction (either regular or multisig) */
  get rawTransaction(): AlgorandRawTransactionStruct | AlgorandRawTransactionMultisigStruct {
    let rawTransaction
    if (this.isMultisig) {
      rawTransaction = this._rawTransactionMultisig
    } else {
      rawTransaction = this._rawTransaction
    }
    return rawTransaction
  }

  /** Determine standard multisig options from raw msig struct */
  private multisigOptionsFromRawTransactionMultisig(msig: AlgorandMultiSignatureMsigStruct): AlgorandMultisigOptions {
    if (Helpers.isNullOrEmpty(msig)) return null
    const addrs = msig.subsig.map(sig =>
      toAddressFromPublicKey(toAlgorandPublicKey(Helpers.byteArrayToHexString(sig.pk))),
    )
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
    if (this.isMultisig) {
      return this?.multiSigOptions?.addrs || []
    }
    // The signerPublicKey is usually based on the from address (or the spending key for a rekeyed account)
    return this.signerPublicKey ? [toAddressFromPublicKey(this.signerPublicKey)] : []
  }

  public get signBuffer(): Buffer {
    // this.assertIsValidated()
    // uses Algo SDK Transaction object
    return this._algoSdkTransaction?.bytesToSign()
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
    this.assertIsValidated()
    if (this.isMultisig) {
      this.signMultiSigTransaction(privateKeys)
    } else {
      const privateKey = Helpers.hexStringToByteArray(privateKeys[0])
      const signResults: AlgorandTxSignResults = algosdk.signTransaction(
        this._actionHelper.actionEncodedForSdk as TransactionLike,
        privateKey,
      )
      this.setRawTransactionFromSignResults(signResults)
      // the signer is the publicKey associated with the privateKey
      this._signedByPublicKey = getAlgorandPublicKeyFromPrivateKey(
        toAlgorandPrivateKey(Helpers.byteArrayToHexString(privateKey)),
      )
    }
  }

  /** Generate signed multisig transaction object and add signatures for every private key provided
   *  Merge signatures with any we might already have in signedTransactionMultisig */
  private signMultiSigTransaction(privateKeys: AlgorandPrivateKey[]) {
    let signedMergedTransaction: AlgorandTxSignResults
    const signedTransactionResults: AlgorandTxSignResults[] = []
    // start with existing multiSig transaction/signatures (if any)
    if (!Helpers.isNullOrEmpty(this._rawTransactionMultisig)) {
      signedTransactionResults.push({
        txID: this.transactionId,
        blob: algosdk.encodeObj(this._rawTransactionMultisig),
      })
    }
    // add signatures for each private key provided
    privateKeys.forEach(key => {
      const privateKey = Helpers.hexStringToByteArray(key)
      const action = this._actionHelper.actionEncodedForSdk
      const privateKeyAddress = toAddressFromPublicKey(getAlgorandPublicKeyFromPrivateKey(key))
      if (!this.multiSigOptions.addrs.includes(privateKeyAddress)) {
        Errors.throwNewError(
          `Cant sign multisig transaction the private key of address ${privateKeyAddress} - it doesnt match an address in multisig options: ${this.multiSigOptions.addrs}`,
        )
      }
      const signResults: AlgorandTxSignResults = algosdk.signMultisigTransaction(
        action as TransactionLike,
        this.multiSigOptions,
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

  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block before returning */
  public send(
    waitForConfirm: Models.ConfirmType = Models.ConfirmType.None,
    communicationSettings?: Models.ChainSettingsCommunicationSettings,
  ): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    const signedTransaction = Helpers.byteArrayToHexString(new Uint8Array(algosdk.encodeObj(this.rawTransaction)))
    return this._chainState.sendTransaction(signedTransaction, waitForConfirm, communicationSettings)
  }

  // helpers

  /** apply options and/or use defaults */
  private applyOptions(options: AlgorandTransactionOptions) {
    this.assertValidOptions(options)
    const { multisigOptions, signerPublicKey } = options || {}
    let { expireSeconds, fee, flatFee } = options || {}
    const { defaultTransactionSettings } = this._chainState?.chainSettings || {}
    expireSeconds = expireSeconds ?? defaultTransactionSettings?.expireSeconds
    fee = fee ?? defaultTransactionSettings?.fee
    flatFee = flatFee ?? defaultTransactionSettings?.flatFee
    this._options = {
      expireSeconds,
      fee,
      flatFee,
      multisigOptions,
      signerPublicKey,
    }
  }

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      Errors.throwNewError('Not connected to chain')
    }
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    // If a specific action.from is specifed, ensure that a signature is attached that matches its address/public key
    if (!this.hasAllRequiredSignatures) {
      Errors.throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRaw) {
      Errors.throwNewError(
        'Transaction doesnt have a raw transaction body. Call prepareToBeSigned() or set a complete transaction using setTransaction().',
      )
    }
  }

  /** Whether action.from is a valid address (and not null or empty) */
  private isFromAValidAddress(): boolean {
    return isValidAlgorandAddress(this?.action?.from)
  }

  /** Throws if from is not null or empty algorand argument */
  private assertFromIsValidAddress(): void {
    if (!this.isFromAValidAddress()) {
      Errors.throwNewError('Transaction action[].from is not a valid address.')
    }
  }

  /** Throws if from is not null or empty algorand argument */
  private assertValidOptions(options: AlgorandTransactionOptions): void {
    if (options?.multisigOptions && options?.signerPublicKey) {
      Errors.throwNewError(
        'Invalid transaction options: Provide multisigOptions OR signerPublicKey - not both. The signerPublicKey is for non-multisig transactions only',
      )
    }
  }

  /** Whether the transaction signature is valid for this transaction body and publicKey provided */
  private isValidTxSignatureForPublicKey(signature: AlgorandSignature, publicKey: AlgorandPublicKey): boolean {
    if (!this.rawTransaction) return false
    const transactionBytesToSign = this.signBuffer // uses Algo SDK Transaction object
    return verifySignatureForDataAndPublicKey(
      Helpers.byteArrayToHexString(transactionBytesToSign),
      publicKey,
      signature,
    )
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
    const multiSigOptionsFromRaw = !Helpers.isNullOrEmpty(txRawStructMultisig?.msig)
      ? this.multisigOptionsFromRawTransactionMultisig(txRawStructMultisig.msig)
      : null
    const multiSigOptions = this.multiSigOptions || multiSigOptionsFromRaw
    // if not multisig, we're done here
    if (Helpers.isNullOrEmpty(multiSigOptions)) return

    const multiSigFrom: AlgorandAddress = determineMultiSigAddress(multiSigOptions)

    // extract fromAddr from various action types
    if (!Helpers.isNullOrEmpty(txRawStruct?.txn)) {
      fromAddr = toAlgorandAddressFromPublicKeyByteArray(txRawStruct.txn?.snd) // AlgorandRawTransactionStruct and AlgorandRawTransactionMultisigStruct
    } else if (Helpers.isAString(txAction.from)) {
      fromAddr = toAlgorandAddress(txAction.from) // AlgorandTxAction and AlgorandTxActionSdkEncoded
    } else {
      fromAddr = toAlgorandAddressFromRawStruct(txRaw.from) // AlgorandTxActionRaw
    }

    if (fromAddr !== multiSigFrom) {
      Errors.throwNewError(
        `From address (or txn.snd) must be the multisig address (hash of multisig options). Got: ${fromAddr}. Expected: ${multiSigFrom}`,
      )
    }
  }

  /** Set the raw trasaction properties from the packed results from using Algo SDK to sign tx */
  private setRawTransactionFromSignResults(signResults: AlgorandTxSignResults) {
    const { transaction } = toRawTransactionFromSignResults(signResults)
    if ((transaction as AlgorandRawTransactionMultisigStruct)?.msig) {
      this._rawTransactionMultisig = transaction as AlgorandRawTransactionMultisigStruct
    } else {
      this._rawTransaction = transaction as AlgorandRawTransactionStruct
    }
  }

  /** JSON representation of transaction data */
  public toJson(): any {
    return {
      header: this.header,
      actions: this.actions,
      raw: this.raw,
      signatures: this.signatures,
    }
  }

  public get supportsCancel() {
    return false
  }

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
    this.assertHasAction()
    const fee = algoToMicro(desiredFee)
    const trx: AlgorandTxAction = {
      ...this._actionHelper.action,
      fee,
      flatFee: true,
    }
    this.actions = [trx]
  }

  /** Ensures that the value comforms to a well-formed EOS signature */
  public toSignature(value: any) {
    return toAlgorandSignature(value)
  }

  /** Returns transaction fee in units of microalgos (expressed as a string) */
  public async getSuggestedFee(priority: Models.TxExecutionPriority): Promise<string> {
    try {
      const { bytes } = await this.resourcesRequired()
      const { suggestedFeePerByte } = this._chainState
      let microalgos = bytes * suggestedFeePerByte * TRANSACTION_FEE_PRIORITY_MULTIPLIERS[priority]
      if (microalgos === 0) microalgos = this._chainState.minimumFeePerTx || MINIMUM_TRANSACTION_FEE_FALLBACK
      return microToAlgoString(microalgos)
    } catch (error) {
      const chainError = mapChainError(error)
      throw chainError
    }
  }

  /** Returns the actual cost of executing the transaction in units of Algos (expressed as a string)
   * Throws if transaction not found on-chain */
  public async getActualCost(): Promise<string> {
    const trx = await this._chainState.getTransactionById(this.transactionId)
    return trx ? microToAlgoString(trx?.fee) : null
  }
}
