/* eslint-disable @typescript-eslint/no-unused-vars */
import { Transaction as EthereumJsTx } from 'ethereumjs-tx'
import { isNull } from 'util'
import { EthereumChainState } from './ethChainState'
import { Transaction } from '../../interfaces'
import { ConfirmType } from '../../models'
import { EthSerializedTransaction, EthTransactionOptions, EthSignature, EthPrivateKey } from './models'
import { throwNewError } from '../../errors'
import { isNullOrEmpty, getUniqueValues } from '../../helpers'
import { isValidEthSignature } from './helpers'

export class EthereumTransaction implements Transaction {
  private _cachedAccounts: any[] = []

  private _actions: any[]

  private _chainState: EthereumChainState

  private _header: any

  private _options: EthTransactionOptions

  private _signatures: Set<EthSignature> // A set keeps only unique values

  private _serialized: any

  private _signBuffer: Buffer

  private _requiredAuthorizations: any[]

  private _isValidated: boolean

  constructor(chainState: EthereumChainState, options?: EthTransactionOptions) {
    this._chainState = chainState
    this._options = options
  }

  // header

  get header() {
    return this._header
  }

  get options() {
    return this._options
  }

  // serialized transaction body

  get serialized() {
    if (!this._serialized) {
      throwNewError(
        'Transaction not yet serialized. Call generateSerialized(). Use transaction.hasSerialized to check before calling transaction.serialized',
      )
    }
    return this._serialized
  }

  get hasSerialized(): boolean {
    return !!this._serialized
  }

  public async generateSerialized(): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (!this._actions) {
      throwNewError('Transaction serialization failure. Transaction has no actions.')
    }
    const { gasPrice, gasLimit, chain, hardfork } = this._options
    const trxRaw = { ...this._actions, gasPrice, gasLimit }
    let trxOptions = {}
    if (!isNullOrEmpty(chain) && !isNullOrEmpty(hardfork)) {
      trxOptions = { chain, hardfork }
    } else if (!(isNullOrEmpty(chain) && isNullOrEmpty(hardfork))) {
      throwNewError('For transaction options, chain and hardfork have to be specified together')
    }
    const trx = new EthereumJsTx(trxRaw, trxOptions)
    this._serialized = trx
    this.setHeaderFromSerialized()
    this.setSignBuffer()
  }

  /** Extract header from serialized transaction body */
  private setHeaderFromSerialized(): void {
    const { nonce, gasPrice, gasLimit } = this._serialized
    this._header = { nonce, gasPrice, gasLimit }
  }

  // TODO
  async setSerialized(serialized: EthSerializedTransaction): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (serialized) {
      const trx = new EthereumJsTx(serialized)
      const { txActions, txHeader } = await this.deserializeWithActions(serialized)
      this._header = txHeader
      this._actions = txActions
      this._serialized = trx
      this._isValidated = false
      this.setSignBuffer()
    }
  }

  /** Creates a sign buffer using serialized transaction body */
  // TODO
  private setSignBuffer() {
    this.assertIsConnected()
    this._signBuffer = this._serialized.hash(false)
  }

  /** Deserializes the transaction header and actions - fetches from the chain to deserialize action data */
  private async deserializeWithActions(serializedTransaction: EthSerializedTransaction): Promise<any> {
    this.assertIsConnected()
    const { nonce, gasLimit, gasPrice, to, value, data } = serializedTransaction // TODO
    return { txActions: { to, value, data }, txHeader: { nonce, gasLimit, gasPrice } }
  }

  // actions

  public get actions() {
    return this._actions
  }

  /** Sets the Array of actions */
  public set actions(actions: any[]) {
    this.assertNoSignatures()
    this._actions = actions
    this._isValidated = false
  }

  public addAction(action: any, options: any): void {
    this.assertNoSignatures()
    const { replace = false } = options || {}
    if (!action) {
      throwNewError('Action parameter is missing')
    }
    if (this._actions?.length > 0 && !replace) {
      throwNewError('Ethereum transaction can only have 1 action')
    }
    this._actions = [action]
  }

  // validation

  public async validate(): Promise<void> {
    if (!this.hasSerialized) {
      throwNewError(
        'Transaction validation failure. Missing serialized transaction. Use setSerialized() or if setting actions, call transaction.generateSerialized().',
      )
    }
    this._isValidated = true
  }

  get isValidated() {
    return this._isValidated
  }

  /** Throws if not validated */
  private assertIsValidated(): void {
    this.assertIsConnected()
    if (!this._isValidated) {
      throwNewError('Transaction not validated. Call transaction.validate() first.')
    }
  }

  // signatures

  get signatures(): any[] {
    if (isNullOrEmpty(this._signatures)) return null
    return [...this._signatures]
  }

  /** Sets the Set of signatures */
  set signatures(signatures: any[]) {
    signatures.forEach(sig => {
      this.assertValidSignature(sig)
    })
    this._signatures = new Set<any>(signatures)
  }

  addSignatures = (signatures: EthSignature[]): void => {
    if (signatures.length !== 1) {
      throwNewError('Ethereum addSignature function only allows signatures array length of 1')
    }
    const { v, r, s } = signatures[0]
    this._serialized.v = v
    this._serialized.r = r
    this._serialized.s = s
  }

  private assertValidSignature = (signature: EthSignature) => {
    if (!isValidEthSignature(signature)) {
      throwNewError(`Not a valid signature : ${signature}`, 'signature_invalid')
    }
  }

  /** Throws if any signatures are attached */
  private assertNoSignatures() {
    if (this.hasAnySignatures) {
      throwNewError(
        'You cant modify the body of the transaction without invalidating the existing signatures. Remove the signatures first.',
      )
    }
  }

  get hasAnySignatures(): boolean {
    return !isNullOrEmpty(this.signatures)
  }

  public get hasAllRequiredSignatures(): boolean {
    const hasAllSignatures = this._requiredAuthorizations?.every(auth => this.hasSignatureForPublicKey(auth.publicKey))
    return hasAllSignatures
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    if (!this.hasAllRequiredSignatures) {
      throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  public get missingSignatures(): any[] {
    this.assertIsValidated()
    const missing = this._requiredAuthorizations?.filter(auth => !this.hasSignatureForPublicKey(auth.publicKey))
    return isNullOrEmpty(missing) ? null : missing // if no values, return null instead of empty array
  }

  public hasSignatureForPublicKey = (publicKey: any): boolean => {
    const hasSignature = false
    // for (const signature of this.signatures || []) {
    //   let pk = getPublicKeyFromSignature(signature, this._signBuffer)
    //   if (pk === publicKey) hasSignature = true;
    //   break
    // }
    return hasSignature
  }
  // TODONOW
  // public async hasSignatureForAuthorization(authorization: any): Promise<boolean> {
  //   const { account, permission } = authorization
  //   let { publicKey } = authorization
  //   if (!authorization.publicKey) {
  //     publicKey = await this.getPublicKeyForAuthorization(account, permission)
  //   }
  //   return this.hasSignatureForPublicKey(publicKey)
  // }

  public get signBuffer(): Buffer {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    return this._signBuffer
  }

  public sign(privateKeys: EthPrivateKey[]): void {
    this.assertIsValidated()
    if (privateKeys.length !== 1) {
      throwNewError('Ethereum sign needs to be providen exactly 1 privateKey')
    }
    const privateKeyBuffer = Buffer.from(privateKeys[0], 'hex')
    this._serialized?.sign(privateKeyBuffer)
  }

  // authorizations

  get requiredAuthorizations() {
    this.assertIsValidated()
    return this._requiredAuthorizations
  }

  // send

  public send(waitForConfirm: ConfirmType = ConfirmType.None): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    // Serializing this._serialized object that has signatures in it { v, r , s }
    const signedTransaction = this._serialized.serialize()

    return this._chainState.sendTransaction(`0x${signedTransaction.toString('hex')}`)
  }

  // helpers

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  public toJson(): any {
    return { ...this._header, actions: this._actions, signatures: this.signatures }
  }

  // TODO: implement complete interface

  // ------------------------ Ethereum Specific functionality -------------------------------
  // Put any Ethereum chain specific feature that aren't included in the standard Transaction interface below here  */
  // calling code can access these functions by first casting the generic object into an eos-specific flavor
  // e.g.   let ethTransaction = (transaction as EthTransaction);
  //        ethTransaction.anyEthSpecificFunction();

  /** Placeholder */
  public anyEthSpecificFunction = () => {}
}
