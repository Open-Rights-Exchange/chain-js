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
  AlgorandMultiSignature,
  AlgorandMultiSigOptions,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandRawTransaction,
  AlgorandSignature,
  AlgorandTransactionAction,
  AlgorandTransactionHeader,
  AlgorandTransactionOptions,
} from './models'
import { AlgorandActionHelper } from './algoAction'
import { isArrayLengthOne, isValidAlgorandAddress, isValidAlgorandSignature, toRawAlgorandPrivateKey } from './helpers'
import { getAlgorandPublicKeyFromAddress } from './algoCrypto'
import { ALGORAND_TRX_COMFIRMATION_ROUNDS } from './algoConstants'

export class AlgorandTransaction implements Transaction {
  private _actionHelper: AlgorandActionHelper

  private _chainState: AlgorandChainState

  private _header: AlgorandTransactionHeader

  private _options: AlgorandTransactionOptions

  /** A set keeps only unique values */
  private _signatures: Set<AlgorandSignature>

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
      lastRound: lastRound + ALGORAND_TRX_COMFIRMATION_ROUNDS,
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
    return [...this._signatures]
  }

  /** Sets the Set of signatures */
  set signatures(signatures: AlgorandSignature[]) {
    this.assertValidSignatures(signatures)
    this._signatures = new Set<AlgorandSignature>(signatures)
  }

  /** Add signatures to raw transaction
   */
  addSignatures = (signatures: AlgorandSignature[]): void => {
    this.assertValidSignatures(signatures)
    const newSignatures = new Set<AlgorandSignature>()
    signatures.forEach(signature => {
      newSignatures.add(signature)
    })
    // add to existing collection of signatures
    this._signatures = new Set<AlgorandSignature>([...(this._signatures || []), ...newSignatures])
    this._signatures = new Set<AlgorandSignature>([...this._signatures, ...signatures])
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
  public hasSignatureForPublicKey(publicKey: AlgorandPublicKey): boolean {
    const decodedPublicKey = decodeBase64(publicKey).toString()
    const sigsToLoop = this.signatures || []
    if (this.multiSigOptions) {
      return sigsToLoop.some(signature => {
        const pks = this.getPublicKeysFromMultiSignature(signature)
        return pks.find(key => key.toString() === decodedPublicKey)
      })
    }
    return this?._fromPublicKey === publicKey
  }

  /** Returns public keys for which a signature is present in the multisignature object */
  private getPublicKeysFromMultiSignature(signature: AlgorandSignature): Uint8Array[] {
    const { msig } = algosdk.decodeObj(signature)
    const multiSigs = msig?.subsig?.filter((sig: AlgorandMultiSignature) => {
      const { s } = sig
      // only return the keys from which signatures are present
      if (s) {
        return true
      }
      return false
    })
    return multiSigs?.map((sig: AlgorandMultiSignature) => sig.pk)
  }

  /** Whether there is an attached signature for the publicKey of the address */
  public async hasSignatureForAuthorization(authorization: AlgorandAddress): Promise<boolean> {
    return this?._fromAddress === authorization
  }

  /** Whether signature is attached to transaction (and/or whether the signature is correct) */
  public get hasAllRequiredSignatures(): boolean {
    this.assertIsValidated()
    return this.missingSignatures === null
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    // If a specific action.from is specifed, ensure that a signature is attached that matches its address/public key
    if (!this.hasAllRequiredSignatures) {
      throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  /** Returns address, for which, a matching signature must be attached to transaction */
  public get missingSignatures(): AlgorandAddress[] {
    this.assertIsValidated()
    const missingSignatures =
      this.requiredAuthorizations?.filter(
        auth => !this.hasSignatureForPublicKey(getAlgorandPublicKeyFromAddress(auth)),
      ) || []

    // check if number of signatures present are greater then or equal to multisig threshold.
    // If so, set missing signatures to null
    if (this.multiSigOptions) {
      return this.multiSigOptions.addrs.length - this.multiSigOptions.threshold <= missingSignatures.length
        ? null
        : missingSignatures
    }

    return isNullOrEmpty(missingSignatures) ? null : missingSignatures // if no values, return null instead of empty array
  }

  /** Returns the required addresses for a transaction/multisig transaction */
  public get requiredAuthorizations(): AlgorandAddress[] {
    return this.requiredAuthorization
  }

  /** Private property to get the required authorizations for the transaction
   * Returns the from address from the action or addresses from multisig options for multisig transaction
   */
  private get requiredAuthorization(): AlgorandAddress[] {
    this.assertIsValidated()
    this.assertFromIsValidAddress()
    if (this.multiSigOptions) {
      return this?.multiSigOptions?.addrs || []
    }
    return this.action.from ? [this.action.from] : []
  }

  /** Returns multisig transaction options */
  private get multiSigOptions(): AlgorandMultiSigOptions {
    return this._options?.multiSigOptions
  }

  public get signBuffer(): Buffer {
    return notImplemented()
  }

  /** Algorand provides the functionality to sign a transaction using multi-signature account */
  public get supportsMultisigTransaction(): boolean {
    return true
  }

  /** Sign the transaction body with private key and add to attached signatures */
  public async sign(privateKeys: AlgorandPrivateKey[]): Promise<void> {
    let signature
    this.assertIsValidated()
    if (this.multiSigOptions) {
      signature = await this.signMultiSigTransaction(privateKeys)
    } else {
      const privateKey = toRawAlgorandPrivateKey(privateKeys[0])
      signature = algosdk.signTransaction(this._raw, privateKey).blob
    }
    this.addSignatures([signature])
    this._fromAddress = this._raw.from
    this._fromPublicKey = getAlgorandPublicKeyFromAddress(this._raw.from)
  }

  /** Createe and merge the signatures for all the private keys required to execute the multisig transaction */
  private async signMultiSigTransaction(privateKeys: AlgorandPrivateKey[]): Promise<AlgorandSignature> {
    const signatures: AlgorandSignature[] = []
    await privateKeys.forEach(key => {
      const privateKey = toRawAlgorandPrivateKey(key)
      const sig = algosdk.signMultisigTransaction(this._raw, this.multiSigOptions, privateKey)
      signatures.push(sig.blob)
    })
    if (signatures.length === 1) {
      return signatures[0]
    }
    return algosdk.mergeMultisigTransactions(signatures)
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
    const [signature] = this.signatures
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
