/* eslint-disable @typescript-eslint/no-unused-vars */
import { Transaction as EthereumJsTx } from 'ethereumjs-tx'
import { isNull } from 'util'
import { bufferToInt } from 'ethereumjs-util'
import { EthereumChainState } from './ethChainState'
import { Transaction } from '../../interfaces'
import { ConfirmType } from '../../models'
import {
  EthereumPrivateKey,
  EthereumRawTransaction,
  EthereumSignature,
  EthereumTransactionOptions,
  EthereumTransactionHeader,
  EthereumTransactionAction,
} from './models'
import { throwNewError } from '../../errors'
import { isNullOrEmpty, getUniqueValues, notSupported, toBuffer } from '../../helpers'
import { isValidEthereumSignature, isLengthOne, toEthereumSignature, toEthBuffer } from './helpers'

export class EthereumTransaction implements Transaction {
  private _cachedAccounts: any[] = []

  private _action: EthereumTransactionAction

  private _chainState: EthereumChainState

  private _header: EthereumTransactionHeader

  private _options: EthereumTransactionOptions

  private _signature: EthereumSignature // A set keeps only unique values

  private _raw: EthereumJsTx

  private _signBuffer: Buffer

  private _isValidated: boolean

  constructor(chainState: EthereumChainState, options?: EthereumTransactionOptions) {
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

  // Raw transaction body

  get raw() {
    if (!this._raw) {
      throwNewError(
        'Raw transaction has not been generated yet. Call prepareToBeSigned(). Use transaction.hasRaw to check before calling transaction.raw',
      )
    }
    return this._raw
  }

  get hasRaw(): boolean {
    return !!this._raw
  }

  public async prepareToBeSigned(): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (!this._action) {
      throwNewError('Transaction serialization failure. Transaction has no actions.')
    }
    const { chain, hardfork } = this._options
    let { gasPrice, gasLimit } = this._options
    const { to, value, data } = this._action
    gasPrice = isNullOrEmpty(gasPrice) ? 1.1 * parseInt(await this._chainState.web3.eth.getGasPrice(), 10) : gasPrice
    console.log('GASPRICE: ', gasPrice)
    gasLimit = isNullOrEmpty(gasLimit) ? (await this._chainState.getBlock('latest')).gasLimit : gasLimit
    const trxRaw = { nonce: 11, to, value, data, gasPrice, gasLimit }
    console.log('RAWTRX', trxRaw)
    let trxOptions = {}
    if (!isNullOrEmpty(chain) && !isNullOrEmpty(hardfork)) {
      trxOptions = { chain, hardfork }
    } else if (!(isNullOrEmpty(chain) && isNullOrEmpty(hardfork))) {
      throwNewError('For transaction options, chain and hardfork have to be specified together')
    }
    this._raw = new EthereumJsTx(trxRaw, trxOptions)
    console.log('Acti', this._raw)
    this.setHeaderFromRaw()
    this.setSignBuffer()
  }

  /** Extract header from raw transaction body */
  private setHeaderFromRaw(): void {
    const { nonce, gasPrice, gasLimit } = this._raw
    this._header = { nonce, gasPrice, gasLimit }
  }

  // TODO
  async setFromRaw(raw: EthereumRawTransaction): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (raw) {
      const trx = new EthereumJsTx(raw)
      const { txAction, txHeader } = await this.deserializeWithActions(raw)
      this._header = txHeader
      this._action = txAction
      this._raw = trx
      this._isValidated = false
      this.setSignBuffer()
    }
  }

  /** Creates a sign buffer using raw transaction body */
  // TODO
  private setSignBuffer() {
    this.assertIsConnected()
    this._signBuffer = this._raw.hash(false)
  }

  /** Deserializes the transaction header and actions - fetches from the chain to deserialize action data */
  private async deserializeWithActions(rawTransaction: EthereumRawTransaction): Promise<any> {
    this.assertIsConnected()
    const { nonce, gasLimit, gasPrice, to, value, data } = rawTransaction // TODO
    return { txAction: { to, value, data }, txHeader: { nonce, gasLimit, gasPrice } }
  }

  // actions

  public get actions() {
    return [this._action]
  }

  /** Sets the Array of actions */
  public set actions(actions: EthereumTransactionAction[]) {
    if (!isLengthOne(actions)) {
      throwNewError('Ethereum set actions function only allows actions array length of 1')
    }
    this.assertNoSignatures()
    // eslint-disable-next-line prefer-destructuring
    this._action = actions[0]
    this._isValidated = false
  }

  public addAction(action: EthereumTransactionAction, asFirstAction?: boolean): void {
    this.assertNoSignatures()
    if (!action) {
      throwNewError('Action parameter is missing')
    }
    if (!isNullOrEmpty(this._action)) {
      throwNewError('addAction failed. Transaction already has an action. Ethereum only supports 1 action.')
    }
    console.log('actionadded')
    this._action = action
    this._isValidated = false
  }

  // validation

  public async validate(): Promise<void> {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction validation failure. Missing raw transaction. Use setFromRaw() or if setting actions, call transaction.prepareToBeSigned().',
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

  get signatures(): EthereumSignature[] {
    if (isNullOrEmpty(this._signature)) return null
    return [this._signature]
  }

  /** Sets the Set of signatures */
  set signatures(signatures: EthereumSignature[]) {
    if (!isLengthOne(signatures)) {
      throwNewError('Ethereum set signatures function only allows signatures array length of 1')
    }
    signatures.forEach(sig => {
      this.assertValidSignature(sig)
    })
    // eslint-disable-next-line prefer-destructuring
    this._signature = signatures[0]
  }

  addSignatures = (signatures: EthereumSignature[]): void => {
    if (isLengthOne(signatures)) {
      throwNewError('Ethereum addSignature function only allows signatures array length of 1')
    }
    const { v, r, s } = signatures[0]
    this._raw.v = toEthBuffer(v)
    this._raw.r = r
    this._raw.s = s
  }

  private assertValidSignature = (signature: EthereumSignature) => {
    if (!isValidEthereumSignature(signature)) {
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

  /** Throws if transaction is missing any signatures */
  private assertHasSignature(): void {
    if (!this.hasAnySignatures) {
      throwNewError('Missing Signature', 'transaction_missing_signature')
    }
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

  public async hasSignatureForAuthorization(authorization: any): Promise<any> {
    notSupported()
  }

  public get hasAllRequiredSignatures(): boolean {
    return notSupported()
  }

  public get missingSignatures(): any {
    return notSupported()
  }

  public get requiredAuthorizations(): any {
    return notSupported()
  }

  public get signBuffer(): Buffer {
    this.assertIsValidated()
    this.assertHasSignature()
    return this._signBuffer
  }

  public sign(privateKeys: EthereumPrivateKey[]): void {
    this.assertIsValidated()
    if (privateKeys.length !== 1) {
      throwNewError('Ethereum sign needs to be providen exactly 1 privateKey')
    }
    const privateKeyBuffer = Buffer.from(privateKeys[0], 'hex')
    this._raw?.sign(privateKeyBuffer)
    this._signature = toEthereumSignature({
      v: bufferToInt(this._raw?.v),
      r: this._raw?.r,
      s: this._raw?.s,
    })
  }

  // send

  public send(waitForConfirm: ConfirmType = ConfirmType.None): Promise<any> {
    this.assertIsValidated()
    this.assertHasSignature()
    // Serializing this._raw object that has signatures in it { v, r , s }
    const signedTransaction = this._raw.serialize()

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
    return { ...this._header, action: this._action, signatures: this.signatures }
  }

  // TODO: implement complete interface

  // ------------------------ Ethereum Specific functionality -------------------------------
  // Put any Ethereum chain specific feature that aren't included in the standard Transaction interface below here  */
  // calling code can access these functions by first casting the generic object into an eos-specific flavor
  // e.g.   let ethTransaction = (transaction as EthTransaction);
  //        ethTransaction.anyEthSpecificFunction();
}
