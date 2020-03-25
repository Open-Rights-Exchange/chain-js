/* eslint-disable @typescript-eslint/no-unused-vars */
import { Transaction as EthereumJsTx } from 'ethereumjs-tx'
import { bufferToInt, privateToAddress, bufferToHex } from 'ethereumjs-util'
import { EMPTY_HEX } from '../../constants'
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
import { isNullOrEmpty, notSupported } from '../../helpers'
import {
  isValidEthereumSignature,
  isLengthOne,
  toEthereumSignature,
  toEthBuffer,
  addPrefixToHex,
  toEthereumPrivateKey,
  toEthereumTxData,
  ethereumTrxArgIsNullOrEmpty,
} from './helpers'
import { EthereumActionHelper } from './ethAction'

export class EthereumTransaction implements Transaction {
  private _cachedAccounts: any[] = []

  private _actionHelper: EthereumActionHelper

  private _chainState: EthereumChainState

  private _header: EthereumTransactionHeader

  private _options: EthereumTransactionOptions

  private _signature: EthereumSignature // A set keeps only unique values

  /** Transaction prepared for signing (raw transaction) */
  private _raw: EthereumJsTx

  private _signBuffer: Buffer

  private _isValidated: boolean

  constructor(chainState: EthereumChainState, options?: EthereumTransactionOptions) {
    this._chainState = chainState
    this._options = options
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
  get raw() {
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
    if (!this._actionHelper) {
      throwNewError('Transaction serialization failure. Transaction has no actions.')
    }
    const { chain, hardfork, nonce } = this._options
    let { gasPrice, gasLimit } = this._options
    const { to, value, data } = this._actionHelper.raw
    gasPrice = isNullOrEmpty(gasPrice) ? 1.1 * parseInt(await this._chainState.web3.eth.getGasPrice(), 10) : gasPrice
    gasLimit = isNullOrEmpty(gasLimit) ? (await this._chainState.getBlock('latest')).gasLimit : gasLimit
    const trxBody = { nonce, to, value, data, gasPrice, gasLimit }
    let trxOptions = {}
    if (!isNullOrEmpty(chain) && !isNullOrEmpty(hardfork)) {
      trxOptions = { chain, hardfork }
    } else if (!(isNullOrEmpty(chain) && isNullOrEmpty(hardfork))) {
      throwNewError('For transaction options, chain and hardfork have to be specified together')
    }
    this._raw = new EthereumJsTx(trxBody, trxOptions)
    this.setHeaderFromRaw()
    this.setSignBuffer()
  }

  /** Extract header from raw transaction body */
  private setHeaderFromRaw(): void {
    this.assertHasRaw()
    const { nonce, gasPrice, gasLimit } = this._raw
    this._header = { nonce, gasPrice, gasLimit }
  }

  /** Set the body of the transaction using Hex raw transaction data */
  async setFromRaw(raw: EthereumRawTransaction): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (raw) {
      const { chain, hardfork } = this._options
      let { gasPrice, gasLimit } = raw
      gasPrice = ethereumTrxArgIsNullOrEmpty(gasPrice)
        ? 1.1 * parseInt(await this._chainState.web3.eth.getGasPrice(), 10)
        : gasPrice
      gasLimit = ethereumTrxArgIsNullOrEmpty(gasLimit) ? (await this._chainState.getBlock('latest')).gasLimit : gasLimit
      this._raw = new EthereumJsTx({ ...raw, gasLimit, gasPrice }, { chain, hardfork })
      const { txAction, txHeader } = this.groupActionData(this._raw)
      this._header = txHeader
      this._actionHelper = new EthereumActionHelper(txAction)
      this._isValidated = false
      this.setSignBuffer()
    }
  }

  /** Creates a sign buffer using raw transaction body */
  private setSignBuffer() {
    this.assertIsConnected()
    this.assertHasRaw()
    this._signBuffer = this._raw.hash(false)
  }

  /** organize the transaction header and actions data */
  private groupActionData(
    rawTransaction: EthereumJsTx,
  ): { txAction: EthereumTransactionAction; txHeader: EthereumTransactionHeader } {
    const { nonce, gasLimit, gasPrice, to, value, data } = rawTransaction
    return { txAction: { to, value, data: toEthereumTxData(data) }, txHeader: { nonce, gasLimit, gasPrice } }
  }

  /** Ethereum transfer & contract actions executed by the transaction */
  public get actions(): EthereumTransactionAction[] {
    if (!this._actionHelper.raw) return null
    return [this._actionHelper.raw]
  }

  /** Sets the Array of actions.
   * Array length has to be exactly 1 because ethereum doesn't support multiple actions
   */
  public set actions(actions: EthereumTransactionAction[]) {
    if (!isLengthOne(actions)) {
      throwNewError('Ethereum set actions function only allows actions array length of 1')
    }
    this.assertNoSignatures()
    // eslint-disable-next-line prefer-destructuring
    this._actionHelper = new EthereumActionHelper(actions[0])
    this._isValidated = false
  }

  /** Add one action to the transaction body
   *  Transaction's action has to be empty to be able to add an action
   *  Therefore asFirstAction option does not affect behavior */
  public addAction(action: EthereumTransactionAction, asFirstAction?: boolean): void {
    this.assertNoSignatures()
    if (!isNullOrEmpty(this._actionHelper)) {
      throwNewError('addAction failed. Transaction already has an action. Ethereum only supports 1 action.')
    }
    this._actionHelper = new EthereumActionHelper(action)
    this._isValidated = false
  }

  // validation

  /** Verifies that raw trx exist.
   *  Throws if any problems */
  public async validate(): Promise<void> {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction validation failure. Missing raw transaction. Use setFromRaw() or if setting actions, call transaction.prepareToBeSigned().',
      )
    }
    this._isValidated = true
  }

  /** Whether transaction has been validated - via vaidate() */
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

  /** Add signature to raw transaction.
   * Array length has to be exactly 1
   */
  addSignatures = (signatures: EthereumSignature[]): void => {
    if (isLengthOne(signatures)) {
      throwNewError('Ethereum addSignature function only allows signatures array length of 1')
    }
    const { v, r, s } = signatures[0]
    this._raw.v = toEthBuffer(v)
    this._raw.r = r
    this._raw.s = s
    // eslint-disable-next-line prefer-destructuring
    this._signature = signatures[0]
  }

  /** Throws if signatures isn't properly formatted */
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

  /** Whether there are any signatures attached */
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

  /** Sign the transaction body with private key and add to attached signatures */
  public async sign(privateKeys: EthereumPrivateKey[]): Promise<void> {
    this.assertIsValidated()
    if (privateKeys.length !== 1) {
      throwNewError('Ethereum sign needs to be providen exactly 1 privateKey')
    }
    const privateKeyBuffer = toEthBuffer(toEthereumPrivateKey(privateKeys[0]))
    if (bufferToHex(this._raw.nonce) === EMPTY_HEX) {
      const addressBuffer = privateToAddress(privateKeyBuffer)
      const address = bufferToHex(addressBuffer)
      this._raw.nonce = toEthBuffer(
        await this._chainState.web3.eth.getTransactionCount(addPrefixToHex(address), 'pending'),
      )
    }
    this._raw?.sign(privateKeyBuffer)
    this._signature = toEthereumSignature({
      v: bufferToInt(this._raw?.v),
      r: this._raw?.r,
      s: this._raw?.s,
    })
  }

  // send

  // TODO add confirmation enum usage
  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block before returning */
  public send(waitForConfirm: ConfirmType = ConfirmType.None): Promise<any> {
    this.assertIsValidated()
    this.assertHasSignature()
    // Serialize the entire transaction for sending to chain (prepared transaction that includes signatures { v, r , s })
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

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRaw) {
      throwNewError('Transaction doenst have a raw transaction body. Call prepareToBeSigned() or use setFromRaw().')
    }
  }

  /** JSON representation of transaction data */
  public toJson(): any {
    return { ...this._header, action: this._actionHelper.raw, signatures: this.signatures }
  }

  // ------------------------ Ethereum Specific functionality -------------------------------
  // Put any Ethereum chain specific feature that aren't included in the standard Transaction interface below here  */
  // calling code can access these functions by first casting the generic object into an eos-specific flavor
  // e.g.   let ethTransaction = (transaction as EthTransaction);
  //        ethTransaction.anyEthSpecificFunction();
}
