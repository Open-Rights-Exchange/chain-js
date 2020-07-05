/* eslint-disable @typescript-eslint/no-unused-vars */
import * as algosdk from 'algosdk'
import { decodeBase64 } from 'tweetnacl-util'
import { Transaction } from '../../interfaces'
import { ConfirmType } from '../../models'
import { throwNewError } from '../../errors'
import { isNullOrEmpty, notImplemented } from '../../helpers'
import { AlgorandChainState } from './algoChainState'
import {
  AlgorandAddress,
  AlgorandChainSettingsCommunicationSettings,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandRawTransaction,
  AlgorandSignature,
  AlgorandTransactionAction,
  AlgorandTransactionHeader,
  AlgorandTransactionOptions,
} from './models'
import { AlgorandActionHelper } from './algoAction'
import {
  isArrayLengthOne,
  toRawAlgorandPrivateKey,
  toUint8Array,
  isValidAlgorandSignature,
  isValidAlgorandAddress,
} from './helpers'
import { getAlgorandPublicKeyFromAddress } from './algoCrypto'

export class AlgorandTransaction implements Transaction {
  private _actionHelper: AlgorandActionHelper

  private _chainState: AlgorandChainState

  private _header: AlgorandTransactionHeader

  private _options: AlgorandTransactionOptions

  /** A set keeps only unique values */
  private _signatures: AlgorandSignature[]

  /** Address retrieved from attached signature */
  private _fromAddress: AlgorandAddress

  /** Public Key retrieved from attached signature */
  private _fromPublicKey: AlgorandPublicKey

  /** Transaction prepared for signing (raw transaction) */
  private _raw: AlgorandRawTransaction

  private _isValidated: boolean

  constructor(chainState: AlgorandChainState, options?: AlgorandTransactionOptions) {
    this._chainState = chainState
    this._options = options || {}
  }

  /** Header that is included when the transaction is sent to the chain
   *  It is part of the transaction body (in the signBuffer) which is signed
   *  The header changes every time prepareToBeSigned() is called since it includes gasPrice, gasLimit, etc.
   */
  get header() {
    return this._header
  }

  /** Options provided when the transaction class was created */
  get options() {
    return this._options
  }

  /** Raw tranasction body (prepared for signing) */
  get raw(): AlgorandRawTransaction {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction has not been prepared to be signed yet. Call prepareToBeSigned() or use setFromRaw(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
    return this._raw
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRaw(): boolean {
    return !!this._raw
  }

  /** Generate the raw transaction body using the actions attached
   *  Also adds a header to the transaction that is included when transaction is signed
   */
  public async prepareToBeSigned(): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    const { fee: fixedFee = null, flatFee = false } = this._options
    const transactionParams = await this._chainState.algoClient.getTransactionParams()
    const { genesisID, genesishashb64, lastRound, fee: suggestedFeePerByte, minFee } = transactionParams
    const fee = flatFee ? fixedFee : minFee
    const { from, to, amount, note } = this._actionHelper.raw
    this._raw = {
      from,
      to,
      amount,
      note,
      genesisID,
      genesisHash: genesishashb64,
      firstRound: lastRound,
      lastRound: lastRound + 1000,
      fee,
      flatFee,
    }
    this.setHeaderFromRaw()
  }

  /** Extract header from raw transaction body */
  private setHeaderFromRaw(): void {
    this.assertHasRaw()
    const { genesisHash, genesisID, fee, flatFee, firstRound, lastRound } = this._raw
    this._header = { genesisHash, genesisID, fee, flatFee, firstRound, lastRound }
  }

  /** Set the body of the transaction using Hex raw transaction data */
  async setFromRaw(raw: AlgorandRawTransaction): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (raw) {
      this._raw = raw
      const { to, from, amount, note, genesisHash, genesisID, fee, flatFee, firstRound, lastRound } = this._raw
      this._header = { genesisHash, genesisID, fee, flatFee, firstRound, lastRound }
      this._actionHelper = new AlgorandActionHelper({ to, from, amount, note })
      this._isValidated = false
    }
  }

  /** Algorand transaction action (transfer & asset related functions)
   */
  public get actions(): AlgorandTransactionAction[] {
    const { action } = this
    if (!action) {
      return null
    }
    return [action]
  }

  /** Private property for the Algorand action - uses _actionHelper */
  private get action(): AlgorandTransactionAction {
    if (!this?._actionHelper?.raw) return null
    const action = { ...this._actionHelper?.raw }
    return action
  }

  /** Sets actions array
   * Array length has to be exactly 1 because algorand doesn't support multiple actions
   */
  public set actions(actions: AlgorandTransactionAction[]) {
    this.assertNoSignatures()
    if (!isArrayLengthOne(actions)) {
      throwNewError('Algorand transaction.actions only accepts an array of exactly 1 action')
    }
    const action = actions[0]
    this._actionHelper = new AlgorandActionHelper(action)
    this._isValidated = false
  }

  /** Add action to the transaction body
   *  throws if transaction.actions already has a value
   *  Ignores asFirstAction parameter since only one action is supported in algorand */
  public addAction(action: AlgorandTransactionAction, asFirstAction?: boolean): void {
    this.assertNoSignatures()
    if (!isNullOrEmpty(this._actionHelper)) {
      throwNewError(
        'addAction failed. Transaction already has an action. Use transaction.actions to replace existing action.',
      )
    }
    this._actionHelper = new AlgorandActionHelper(action)
    this._isValidated = false
  }

  // validation

  /** Verifies that raw trx exists
   *  Throws if any problems */
  public async validate(): Promise<void> {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction validation failure. Missing raw transaction. Use setFromRaw() or if setting actions, call transaction.prepareToBeSigned().',
      )
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
      throwNewError('Transaction not validated. Call transaction.validate() first.')
    }
  }

  // signatures

  /** Signatures attached to transaction */
  get signatures(): AlgorandSignature[] {
    if (isNullOrEmpty(this._signatures)) return null
    return this._signatures
  }

  /** Sets the Set of signatures */
  set signatures(signatures: AlgorandSignature[]) {
    this.assertValidSignatures(signatures)
    this._signatures = signatures
  }

  /** Add signature to raw transaction
   * Accepts array with exactly one signature
   */
  addSignatures = (signatures: AlgorandSignature[]): void => {
    this._signatures = signatures
  }

  /** Throws if signatures isn't properly formatted */
  private assertValidSignatures = (signatures: AlgorandSignature[]) => {
    signatures.forEach(sig => {
      if (!isValidAlgorandSignature(sig)) {
        throwNewError(`Not a valid signature : ${sig}`, 'signature_invalid')
      }
    })
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

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey = (publicKey: AlgorandPublicKey): boolean => {
    return this?._fromPublicKey === publicKey
  }

  /** Whether there is an attached signature for the publicKey of the address */
  public async hasSignatureForAuthorization(authorization: AlgorandAddress): Promise<boolean> {
    return this?._fromAddress === authorization
  }

  /** Whether signature is attached to transaction (and/or whether the signature is correct) */
  public get hasAllRequiredSignatures(): boolean {
    return this.requiredAuthorization === this._fromAddress
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    // If a specific action.from is specifed, ensure that a signature is attached that matches its address/public key
    if (!this.hasAllRequiredSignatures) {
      throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  /** Returns address, for which, a matching signature must be attached to transaction
   *  Throws if actions[].from is not a valid address - needed to determine the required signature */
  public get missingSignatures(): AlgorandAddress[] {
    this.assertIsValidated()
    const missingSignature = this.hasAllRequiredSignatures ? null : this.requiredAuthorization
    return isNullOrEmpty(missingSignature) ? null : [missingSignature] // if no values, return null instead of empty array
  }

  /** Returns address specified by actions[].from property
   * throws if actions[].from is not a valid address - needed to determine the required signature */
  public get requiredAuthorizations(): AlgorandAddress[] {
    return [this.requiredAuthorization]
  }

  /** private property for the one signature address required (by action.from) */
  private get requiredAuthorization(): AlgorandAddress {
    this.assertIsValidated()
    this.assertFromIsValidAddress()
    return this.action.from
  }

  public get signBuffer(): Buffer {
    return notImplemented()
  }

  /** Sign the transaction body with private key and add to attached signatures */
  public async sign(privateKeys: AlgorandPrivateKey[]): Promise<void> {
    this.assertIsValidated()
    const privateKey = toRawAlgorandPrivateKey(privateKeys[0])
    const signedTransaction = algosdk.signTransaction(this._raw, privateKey)
    const signature = signedTransaction.blob
    this._signatures = [signature]
    this._fromAddress = this._raw.from
    this._fromPublicKey = getAlgorandPublicKeyFromAddress(this._raw.from)
  }

  // send

  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block before returning */
  public send(
    waitForConfirm: ConfirmType = ConfirmType.None,
    communicationSettings?: AlgorandChainSettingsCommunicationSettings,
  ): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    const signature = this._signatures[0]
    return this._chainState.sendTransaction(signature, waitForConfirm, communicationSettings)
  }

  // helpers

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRaw) {
      throwNewError('Transaction doenst have a raw transaction body. Call prepareToBeSigned() or use setFromRaw().')
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

  /** JSON representation of transaction data */
  public toJson(): any {
    return { header: this.header, actions: this.actions, raw: this.raw, signatures: this.signatures }
  }
}
