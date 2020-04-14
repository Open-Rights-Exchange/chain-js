/* eslint-disable @typescript-eslint/no-unused-vars */
import { Transaction as EthereumJsTx } from 'ethereumjs-tx'
import { bufferToInt, privateToAddress, bufferToHex, publicToAddress } from 'ethereumjs-util'
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
  EthereumAddress,
  EthereumPublicKey,
} from './models'
import { throwNewError } from '../../errors'
import { isNullOrEmpty } from '../../helpers'
import {
  isValidEthereumSignature,
  isArrayLengthOne,
  toEthereumSignature,
  toEthBuffer,
  addPrefixToHex,
  toEthereumPrivateKey,
  toEthereumTxData,
  ethereumTrxArgIsNullOrEmpty,
  toEthereumPublicKey,
  toEthereumAddress,
} from './helpers'
import { EthereumActionHelper } from './ethAction'

export class EthereumTransaction implements Transaction {
  private _actionHelper: EthereumActionHelper

  private _chainState: EthereumChainState

  private _header: EthereumTransactionHeader

  private _options: EthereumTransactionOptions

  /** A set keeps only unique values */
  private _signature: EthereumSignature

  /** Address retrieved from attached signature */
  private _fromAddress: EthereumAddress

  /** Public Key retrieved from attached signature */
  private _fromPublicKey: EthereumPublicKey

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
  get raw(): EthereumRawTransaction {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction has not been prepared to be signed yet. Call prepareToBeSigned() or use setFromRaw(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
    const { nonce, gasLimit, gasPrice, to, value, data, v, r, s } = this._raw
    return { nonce, gasLimit, gasPrice, to, value, data: toEthereumTxData(data), v, r, s }
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
    const { chainSettings } = this._chainState
    const { chainForkType } = chainSettings
    const { chainName, hardFork } = chainForkType
    const { nonce } = this._options
    let { gasPrice, gasLimit } = this._options
    const { to, value, data } = this._actionHelper.raw
    gasPrice = isNullOrEmpty(gasPrice) ? 1 * parseInt(await this._chainState.web3.eth.getGasPrice(), 10) : gasPrice
    gasLimit = isNullOrEmpty(gasLimit) ? (await this._chainState.getBlock('latest')).gasLimit : gasLimit
    const trxBody = { nonce, to, value, data, gasPrice, gasLimit }
    const trxOptions = { chain: chainName, hardfork: hardFork }
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

  /** Ethereum transaction action (transfer & contract functions)
   * Returns null or an array with exactly one action
   */
  public get actions(): EthereumTransactionAction[] {
    const { action } = this
    if (!action) {
      return null
    }
    return [action]
  }

  /** Private property for the Ethereum contract action - uses _actionHelper */
  private get action(): EthereumTransactionAction {
    if (!this?._actionHelper?.raw) return null
    const action = { ...this._actionHelper?.raw, contract: this._actionHelper?.contract }
    return action
  }

  /** Sets actions array
   * Array length has to be exactly 1 because ethereum doesn't support multiple actions
   */
  public set actions(actions: EthereumTransactionAction[]) {
    this.assertNoSignatures()
    if (!isArrayLengthOne(actions)) {
      throwNewError('Ethereum transaction.actions only accepts an array of exactly 1 action')
    }
    const action = actions[0]
    // eslint-disable-next-line prefer-destructuring
    this._actionHelper = new EthereumActionHelper(action)
    this._isValidated = false
  }

  /** Add action to the transaction body
   *  throws if transaction.actions already has a value
   *  Ignores asFirstAction parameter since only one action is supported in ethereum */
  public addAction(action: EthereumTransactionAction, asFirstAction?: boolean): void {
    this.assertNoSignatures()
    if (!isNullOrEmpty(this._actionHelper)) {
      throwNewError(
        'addAction failed. Transaction already has an action. Use transaction.actions to replace existing action.',
      )
    }
    this._actionHelper = new EthereumActionHelper(action)
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
  get signatures(): EthereumSignature[] {
    if (isNullOrEmpty(this._signature)) return null
    return [this._signature]
  }

  /** Sets the Set of signatures */
  set signatures(signatures: EthereumSignature[]) {
    if (!isArrayLengthOne(signatures)) {
      throwNewError('Ethereum set signatures function only allows signatures array length of 1')
    }
    const signature = signatures[0]
    this.assertValidSignature(signature)
    this._signature = signature
  }

  /** Add signature to raw transaction
   * Accepts array with exactly one signature
   */
  addSignatures = (signatures: EthereumSignature[]): void => {
    if (isArrayLengthOne(signatures)) {
      throwNewError('Ethereum addSignature function only allows signatures array length of 1')
    }
    const signature = signatures[0]
    const { v, r, s } = signature
    this._raw.v = toEthBuffer(v)
    this._raw.r = r
    this._raw.s = s
    this._signature = signature
  }

  /** Throws if signatures isn't properly formatted */
  private assertValidSignature = (signature: EthereumSignature) => {
    if (!isValidEthereumSignature(signature)) {
      throwNewError(`Not a valid signature : ${signature}`, 'signature_invalid')
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

  /** Throws if transaction is missing any signatures */
  private assertHasSignature(): void {
    if (!this.hasAnySignatures) {
      throwNewError('Missing Signature', 'transaction_missing_signature')
    }
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey = (publicKey: EthereumPublicKey): boolean => {
    return this?._fromPublicKey === publicKey
  }

  /** Whether there is an attached signature for the publicKey of the address */
  public async hasSignatureForAuthorization(authorization: EthereumAddress): Promise<boolean> {
    return this?._fromAddress === authorization
  }

  /** Whether signature is attached to transaction (and/or whether the signature is correct)
   * If a specific action.from is specifed, ensure that attached signature matches its address/public key */
  public get hasAllRequiredSignatures(): boolean {
    // If a specific action.from is specifed, ensure that a signature is attached that matches its address/public key
    if (this.isFromIsValidAddress()) {
      return this.requiredAuthorization === this._fromAddress
    }
    // if no specific action.from, just confirm any signature is attached
    return this.hasAnySignatures
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    // If a specific action.from is specifed, ensure that a signature is attached that matches its address/public key
    if (!this.hasAllRequiredSignatures) {
      throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  /** Returns address, for which, a matching signature must be attached to transaction
   *  ... always an array of length 1 because ethereum only supports one signature
   *  Throws if actions[].from is not a valid address - needed to determine the required signature */
  public get missingSignatures(): EthereumAddress[] {
    this.assertIsValidated()
    const missingSignature = this.hasAllRequiredSignatures ? null : this.requiredAuthorization
    return isNullOrEmpty(missingSignature) ? null : [missingSignature] // if no values, return null instead of empty array
  }

  /** Returns address specified by actions[].from property
   * throws if actions[].from is not a valid address - needed to determine the required signature */
  public get requiredAuthorizations(): EthereumAddress[] {
    return [this.requiredAuthorization]
  }

  /** private property for the one signature address required (by action.from) */
  private get requiredAuthorization(): EthereumAddress {
    this.assertIsValidated()
    this.assertFromIsValidAddress()
    return this.action.from
  }

  public get signBuffer(): Buffer {
    this.assertIsValidated()
    this.assertHasSignature()
    return this._signBuffer
  }

  /** Sign the transaction body with private key and add to attached signatures */
  public async sign(privateKeys: EthereumPrivateKey[]): Promise<void> {
    this.assertIsValidated()
    if (!isArrayLengthOne(privateKeys)) {
      throwNewError('Ethereum sign() requires privateKeys array of length one')
    }
    const privateKey = privateKeys[0]
    const privateKeyBuffer = toEthBuffer(toEthereumPrivateKey(privateKey))
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
    this._raw.verifySignature()
    this._fromAddress = toEthereumAddress(bufferToHex(this._raw.getSenderAddress()))
    this._fromPublicKey = toEthereumPublicKey(bufferToHex(this._raw.getSenderPublicKey()))
  }

  // send

  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block before returning */
  public send(waitForConfirm: ConfirmType = ConfirmType.None): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
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

  /** Whether action.from is a valid address (and not null or empty e.g. '0x00') */
  private isFromIsValidAddress(): boolean {
    return !ethereumTrxArgIsNullOrEmpty(this?.action?.from)
  }

  /** Throws is from is not null or empty ethereum argument */
  private assertFromIsValidAddress(): void {
    if (!this.isFromIsValidAddress()) {
      throwNewError('Transaction action[].from is not a valid address.')
    }
  }

  /** JSON representation of transaction data */
  public toJson(): any {
    return { header: this.header, actions: this.actions, raw: this.raw, signatures: this.signatures }
  }

  // ------------------------ Ethereum Specific functionality -------------------------------
  // Put any Ethereum chain specific feature that aren't included in the standard Transaction interface below here  */
  // calling code can access these functions by first casting the generic object into an eos-specific flavor
  // e.g.   let ethTransaction = (transaction as EthTransaction);
  //        ethTransaction.anyEthSpecificFunction();
}
