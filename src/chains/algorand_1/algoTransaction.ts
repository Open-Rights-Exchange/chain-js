/* eslint-disable @typescript-eslint/no-unused-vars */
import * as algosdk from 'algosdk'
import { Transaction } from '../../interfaces'
import { ConfirmType } from '../../models'
import { throwNewError } from '../../errors'
import {
  byteArrayToHexString,
  hexStringToByteArray,
  isArrayLengthOne,
  isNullOrEmpty,
  notImplemented,
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
  AlgorandSignature,
  AlgorandTransactionOptions,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxHeaderParams,
} from './models'
import { AlgorandActionHelper } from './algoAction'
import { isValidAlgorandAddress, isValidAlgorandSignature, toAlgorandPublicKey } from './helpers'
import {
  toAlgorandSignatureFromRawSig,
  toPublicKeyFromAddress,
  toRawSignatureFromAlgoSig,
  concatUint8Arrays,
} from './helpers/cryptoModelHelpers'
import { ALGORAND_TRX_COMFIRMATION_ROUNDS } from './algoConstants'

export class AlgorandTransaction implements Transaction {
  private _actionHelper: AlgorandActionHelper

  private _chainState: AlgorandChainState

  private _header: AlgorandTxHeaderParams

  private _options: AlgorandTransactionOptions

  /** A set keeps only unique values */
  private _signatures: Set<AlgorandSignature>

  /** Address retrieved from attached signature */
  private _fromAddress: AlgorandAddress

  /** Public Key retrieved from attached signature */
  private _fromPublicKey: AlgorandPublicKey

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
  get raw(): AlgorandTxActionRaw {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction has not been prepared to be signed yet. Call prepareToBeSigned() or use setFromRaw(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
    return this._actionHelper.raw
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRaw(): boolean {
    return !!this._actionHelper.raw
  }

  /** Generate the raw transaction body using the actions attached
   *  Also adds a header to the transaction that is included when transaction is signed
   */
  public async prepareToBeSigned(): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    this.assertHasAction()
    const chainTxHeaderParams: AlgorandChainTransactionParamsStruct = await this._chainState.algoClient.getTransactionParams()
    this._actionHelper.applyCurrentTxHeaderParamsWhereNeeded(chainTxHeaderParams)
    this.setHeaderFromRaw()
  }

  /** Extract header from raw transaction body */
  private setHeaderFromRaw(): void {
    this.assertHasRaw()
    const { genesisHash, genesisID, fee, flatFee, firstRound, lastRound } = this.raw
    this._header = { genesisHash, genesisID, fee, flatFee, firstRound, lastRound }
  }

  /** Set the body of the transaction using Hex raw transaction data */
  async setFromRaw(raw: AlgorandTxActionRaw): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (raw) {
      this._actionHelper = new AlgorandActionHelper(raw)
      this.setHeaderFromRaw()
      this._isValidated = false
    }
  }

  /** Algorand transaction action (transfer & asset related functions)
   */
  public get actions(): AlgorandTxAction[] {
    const { action } = this
    if (!action) {
      return null
    }
    return [action]
  }

  /** Private property for the Algorand action - uses _actionHelper */
  private get action(): AlgorandTxAction {
    if (!this.hasRaw) return null
    return { ...this._actionHelper?.action }
  }

  /** Sets actions array
   * Array length has to be exactly 1 because algorand doesn't support multiple actions
   */
  public set actions(actions: AlgorandTxAction[]) {
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
  public addAction(action: AlgorandTxAction, asFirstAction?: boolean): void {
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
    if (this.isMultiSig && this.hasAnySignatures) {
      // use the merge function to merge multisignatures together
      const rawSigsToMerge = [
        ...this.signatures.map(toRawSignatureFromAlgoSig),
        ...signatures.map(toRawSignatureFromAlgoSig),
      ]
      this._signatures = new Set<AlgorandSignature>([
        toAlgorandSignatureFromRawSig(algosdk.mergeMultisigTransactions(rawSigsToMerge)),
      ])
    } else {
      const newSignatures = new Set<AlgorandSignature>()
      signatures.forEach(signature => {
        newSignatures.add(signature)
      })
      // add to existing collection of signatures
      this._signatures = new Set<AlgorandSignature>([...(this._signatures || []), ...newSignatures])
    }
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

  /** Throws if an action isn't attached to this transaction */
  private assertHasAction() {
    if (isNullOrEmpty(this._actionHelper)) {
      throwNewError('Transaction has no action. You can set the action using transaction.actions.')
    }
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey(publicKey: AlgorandPublicKey): boolean {
    const sigsToLoop = this.signatures || []
    if (this.isMultiSig) {
      return sigsToLoop.some(signature => {
        const pks = this.getPublicKeysFromMultiSignature(signature)
        return pks.find(key => key === publicKey)
      })
    }
    return this?._fromPublicKey === publicKey
  }

  /** Returns public keys for which a signature is present in the multisignature object */
  private getPublicKeysFromMultiSignature(signature: AlgorandSignature): AlgorandPublicKey[] {
    const { msig } = algosdk.decodeObj(toRawSignatureFromAlgoSig(signature))
    const multiSigs =
      msig?.subsig?.filter((sig: AlgorandMultiSignatureStruct) => {
        // only return the keys from which signatures are present
        return !!sig?.s
      }) || []
    return multiSigs?.map((sig: AlgorandMultiSignatureStruct) => toAlgorandPublicKey(byteArrayToHexString(sig.pk)))
  }

  /** Whether there is an attached signature for the publicKey of the address */
  public async hasSignatureForAuthorization(authorization: AlgorandAddress): Promise<boolean> {
    return this?._fromAddress === authorization
  }

  /** Whether signature is attached to transaction (and/or whether the signature is correct) */
  public get hasAllRequiredSignatures(): boolean {
    this.assertIsValidated()
    return isNullOrEmpty(this.missingSignatures)
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
      this.requiredAuthorizations?.filter(auth => !this.hasSignatureForPublicKey(toPublicKeyFromAddress(auth))) || []
    const signaturesAttachedCount = (this.requiredAuthorizations?.length || 0) - missingSignatures.length

    // check if number of signatures present are greater then or equal to multisig threshold
    // If threshold reached, return null for missing signatures
    if (this.isMultiSig) {
      return signaturesAttachedCount >= this.multiSigOptions.threshold ? null : missingSignatures
    }

    return isNullOrEmpty(missingSignatures) ? null : missingSignatures // if no values, return null instead of empty array
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

  /** Returns whether the transaction is a multisig transaction */
  public get isMultiSig(): boolean {
    return !isNullOrEmpty(this.multiSigOptions)
  }

  /** Sign the transaction body with private key and add to attached signatures */
  public async sign(privateKeys: AlgorandPrivateKey[]): Promise<void> {
    let signature: AlgorandSignature
    this.assertIsValidated()
    if (this.isMultiSig) {
      signature = this.signMultiSigTransaction(privateKeys)
    } else {
      const privateKey = hexStringToByteArray(privateKeys[0])
      const { blob: signatureBlob, txID: transactionId } = algosdk.signTransaction(
        this._actionHelper.actionEncodedForSdk,
        privateKey,
      )
      signature = toAlgorandSignatureFromRawSig(signatureBlob)
    }
    this.addSignatures([signature])
    this._fromAddress = this.action.from
    this._fromPublicKey = toPublicKeyFromAddress(this.action.from)
  }

  /** Createe and merge the signatures for all the private keys required to execute the multisig transaction */
  private signMultiSigTransaction(privateKeys: AlgorandPrivateKey[]): AlgorandSignature {
    const rawSignatures: Uint8Array[] = []
    privateKeys.forEach(key => {
      const privateKey = hexStringToByteArray(key)
      const action = this._actionHelper.actionEncodedForSdk
      const sig = algosdk.signMultisigTransaction(action, this.multiSigOptions, privateKey).blob
      rawSignatures.push(sig)
    })
    if (rawSignatures.length > 1) {
      return toAlgorandSignatureFromRawSig(algosdk.mergeMultisigTransactions(rawSignatures))
    }
    return toAlgorandSignatureFromRawSig(rawSignatures[0])
  }

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
