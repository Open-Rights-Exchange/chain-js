/* eslint-disable @typescript-eslint/no-unused-vars */
import { Transaction as EthereumJsTx } from 'ethereumjs-tx'
import { bufferToInt, privateToAddress, bufferToHex, BN } from 'ethereumjs-util'
import { EMPTY_HEX, TRANSACTION_FEE_PRIORITY_MULTIPLIERS } from './ethConstants'
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
  EthereumAddressBuffer,
  EthereumPublicKey,
  EthereumBlockType,
  EthereumChainSettingsCommunicationSettings,
  EthereumActionHelperInput,
  EthereumTransactionCost,
  EthereumTransactionResources,
  EthereumTxExecutionPriority,
  EthUnit,
} from './models'
import { throwNewError } from '../../errors'
import { ensureHexPrefix, isArrayLengthOne, isNullOrEmpty, nullifyIfEmpty } from '../../helpers'
import {
  convertBufferToHexStringIfNeeded,
  convertEthUnit,
  isNullOrEmptyEthereumValue,
  isValidEthereumAddress,
  isValidEthereumSignature,
  nullifyIfEmptyEthereumValue,
  toEthBuffer,
  toEthereumPublicKey,
  toEthereumSignature,
  toGweiFromWei,
  toWeiString,
} from './helpers'
import { EthereumActionHelper } from './ethAction'

export class EthereumTransaction implements Transaction {
  private _actionHelper: EthereumActionHelper

  private _chainState: EthereumChainState

  private _actualCost: string

  private _desiredFee: string

  /** estimated gas for transacton - encoded as string to handle big numbers */
  private _estimatedGas: string

  /** Transaction object (using ethereumjs-tx library) */
  private _ethereumJsTx: EthereumJsTx

  private _executionPriority: EthereumTxExecutionPriority

  private _maxFeeIncreasePercentage: number

  private _isValidated: boolean

  private _options: EthereumTransactionOptions

  private _signBuffer: Buffer

  constructor(chainState: EthereumChainState, options?: EthereumTransactionOptions) {
    this._chainState = chainState
    this._options = options
    this.applyDefaultOptions()
  }

  private applyDefaultOptions() {
    this._maxFeeIncreasePercentage =
      this._options?.maxFeeIncreasePercentage ??
      this._chainState?.chainSettings?.defaultTransactionSettings?.maxFeeIncreasePercentage
    this._executionPriority =
      this._options?.executionPriority ??
      this._chainState?.chainSettings?.defaultTransactionSettings?.executionPriority ??
      EthereumTxExecutionPriority.Average
  }

  /** Multisig transactions are not supported by ethereum */
  public get isMultiSig(): boolean {
    return false
  }

  /** Whether transaction has been validated - via validate() */
  get isValidated() {
    return this._isValidated
  }

  /** Address from which transaction is being sent- from action.from (if provided) or derived from attached signature */
  get senderAddress() {
    return nullifyIfEmptyEthereumValue(this.action?.from) || nullifyIfEmptyEthereumValue(this.signedByAddress)
  }

  /** Address retrieved from attached signature - Returns null if no signature attached */
  get signedByAddress(): EthereumAddress {
    if (!this._ethereumJsTx) return null
    try {
      // getSenderAddress throws if sig not attached - so we catch that and return null in that case
      return bufferToHex(this._ethereumJsTx.getSenderAddress())
    } catch (error) {
      return null
    }
  }

  /** Public Key retrieved from attached signature - Returns null if no from value or signature attached */
  get signedByPublicKey(): EthereumPublicKey {
    if (!this._ethereumJsTx) return null
    try {
      // getSenderPublicKey throws if sig not attached - so we catch that and return null in that case
      return toEthereumPublicKey(bufferToHex(this._ethereumJsTx.getSenderPublicKey()))
    } catch (error) {
      return null
    }
  }

  /** Header includes values included in transaction when sent to the chain
   *  These values are set by setRawProperties() is called since it includes gasPrice, gasLimit, etc.
   */
  get header(): EthereumTransactionHeader {
    this.assertHasRaw()
    const { nonce, gasPrice, gasLimit } = this.raw
    return {
      nonce: nullifyIfEmpty(bufferToHex(nonce)),
      gasLimit: nullifyIfEmpty(bufferToHex(gasLimit)),
      gasPrice: nullifyIfEmpty(bufferToHex(gasPrice)),
    }
  }

  /** Options provided when the transaction class was created */
  get options() {
    return this._options
  }

  /** Raw transaction body - all values are Buffer types */
  get raw(): EthereumRawTransaction {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction has no action. Set action or use setFromRaw(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
    const { nonce, gasLimit, gasPrice, to, value, data, v, r, s } = this._ethereumJsTx
    return { nonce, gasLimit, gasPrice, to, value, data, v, r, s }
  }

  /** Whether the raw transaction body has been set (via setting action or setFromRaw()) */
  get hasRaw(): boolean {
    return !!this._ethereumJsTx
  }

  /** Ethereum doesn't have any native multi-sig functionality */
  get supportsMultisigTransaction(): boolean {
    return false
  }

  /**
   *  Updates 'raw' transaction properties using the actions attached
   *  Creates and sets private _ethereumJsTx (web3 EthereumJsTx object)
   *  Also adds header values (nonce, gasPrice, gasLimit) if not already set in action
   */
  private setRawProperties(): void {
    this.assertIsConnected()
    this.assertHasAction()
    this.assertHasFeeSetting()
    if (!this._actionHelper) {
      throwNewError('Failed to set raw transaction properties. Transaction has no actions.')
    }
    const { gasLimit: gasLimitOptions, gasPrice: gasPriceOptions, nonce: nonceOptions } = this._options || {}
    const { gasPrice: gasPriceAction, gasLimit: gasLimitAction, nonce: nonceAction } = this._actionHelper.action

    // Convert gas price returned from getGasPrice to Gwei
    const gasPrice =
      nullifyIfEmpty(gasPriceAction) ||
      nullifyIfEmpty(gasPriceOptions) ||
      Math.round(toGweiFromWei(new BN(this._chainState.chainInfo.nativeInfo.currentGasPrice))).toString() // round up to nearest integer in GWEI
    const gasLimit = nullifyIfEmpty(gasLimitAction) || nullifyIfEmpty(gasLimitOptions)
    const nonce = nullifyIfEmpty(nonceAction) || nullifyIfEmpty(nonceOptions)
    // update action helper with updated nonce and gas values
    const trxBody: EthereumActionHelperInput = { ...this._actionHelper.action, nonce, gasPrice, gasLimit }
    const trxOptions = this.getOptionsForEthereumJsTx()
    this._actionHelper = new EthereumActionHelper(trxBody, trxOptions)
    this.updateEthTxFromAction()
    this.setSignBuffer()
  }

  /** update locally cached EthereumJsTx from action helper data */
  updateEthTxFromAction() {
    const trxOptions = this.getOptionsForEthereumJsTx()
    this._ethereumJsTx = new EthereumJsTx(this._actionHelper.raw, trxOptions)
  }

  /**
   *  Updates nonce and gas fees (if necessary) - these values must be present
   */
  public async prepareToBeSigned(): Promise<void> {
    this.assertIsConnected()
    this.assertHasAction()
    await this.setNonceIfEmpty(this.senderAddress)
    // set gasLimit if not already set, set it using the execution Priority specified for this transaction
    if (isNullOrEmptyEthereumValue(this._actionHelper.action.gasLimit)) {
      const gasFee = await this.getSuggestedFee(this._executionPriority)
      await this.setDesiredFee(gasFee)
    }
  }

  /** Set the body of the transaction using Hex raw transaction data */
  async setFromRaw(raw: EthereumActionHelperInput): Promise<void> {
    this.assertIsConnected()
    if (raw) {
      const trxOptions = this.getOptionsForEthereumJsTx()
      this._actionHelper = new EthereumActionHelper(raw, trxOptions)
      this.setRawProperties()
      this._isValidated = false
    }
  }

  /** Creates a sign buffer using raw transaction body */
  private setSignBuffer() {
    this.assertIsConnected()
    this.assertHasRaw()
    this._signBuffer = this._ethereumJsTx.hash(false)
  }

  /** calculates a unique nonce value for the tx (if not already set) by using the chain transaction count for a given address */
  async setNonceIfEmpty(fromAddress: EthereumAddress | EthereumAddressBuffer) {
    if (isNullOrEmpty(fromAddress)) return
    this.assertHasRaw()
    const address = convertBufferToHexStringIfNeeded(fromAddress)
    if (isNullOrEmptyEthereumValue(this.raw?.nonce)) {
      const txCount = await this._chainState.getTransactionCount(address, EthereumBlockType.Pending)
      this._actionHelper.nonce = txCount.toString()
      this.updateEthTxFromAction()
    }
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
    if (!this?._actionHelper?.action) return null
    const action = { ...this._actionHelper?.action, contract: this._actionHelper?.contract }
    return action
  }

  /** Sets actions array
   * Array length has to be exactly 1 because ethereum doesn't support multiple actions
   */
  public set actions(actions: EthereumTransactionAction[]) {
    this.assertNoSignatures()
    if (isNullOrEmpty(actions)) {
      this._actionHelper = null
      this._isValidated = false
      return
    }
    if (!isArrayLengthOne(actions)) {
      throwNewError('Ethereum transaction.actions only accepts an array of exactly 1 action')
    }
    this.addAction(actions[0])
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
    const trxOptions = this.getOptionsForEthereumJsTx()
    this._actionHelper = new EthereumActionHelper(action, trxOptions)
    this.setRawProperties()
    this._isValidated = false
  }

  // validation

  /** Verifies that raw trx exists, sets nonce (using sender's address) if not already set
   *  Throws if any problems */
  public async validate(): Promise<void> {
    if (!this.hasRaw) {
      throwNewError('Transaction validation failure. Transaction has no action. Set action or use setFromRaw().')
    }
    const { gasPrice, gasLimit } = this._ethereumJsTx
    if (isNullOrEmptyEthereumValue(gasPrice) || isNullOrEmptyEthereumValue(gasLimit)) {
      throwNewError('Transaction validation failure.Missing gasPrice or gasLimit.Call prepareToBeSigned() to auto-set.')
    }
    // make sure the from address is a valid Eth address
    this.assertFromIsValid()
    this._isValidated = true
  }

  // signatures

  /** Get signature attached to transaction - returns null if no signature */
  get signatures(): EthereumSignature[] {
    const { v, r, s } = this._ethereumJsTx || {}
    if (isNullOrEmpty(v) || isNullOrEmpty(r) || isNullOrEmpty(s)) {
      return null // return null instead of empty array
    }
    const signature = toEthereumSignature({
      v: bufferToInt(v),
      r,
      s,
    })

    return [signature]
  }

  /** Sets the Set of signatures */
  set signatures(signatures: EthereumSignature[]) {
    this.addSignatures(signatures)
  }

  /** Add signature to raw transaction - Accepts array with exactly one signature */
  addSignatures = (signatures: EthereumSignature[]): void => {
    if (isNullOrEmpty(signatures) && this.hasRaw) {
      this._ethereumJsTx.v = null
      this._ethereumJsTx.r = null
      this._ethereumJsTx.s = null
    } else if (!isArrayLengthOne(signatures)) {
      throwNewError('Ethereum addSignature function only allows signatures array length of 1')
    } else {
      this.assertHasRaw()
      const signature = signatures[0]
      this.assertValidSignature(signature)
      const { v, r, s } = signature
      this._ethereumJsTx.v = toEthBuffer(v)
      this._ethereumJsTx.r = r
      this._ethereumJsTx.s = s
    }
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
    return this.signedByPublicKey === publicKey
  }

  /** Whether there is an attached signature for the publicKey of the address */
  public async hasSignatureForAuthorization(authorization: EthereumAddress): Promise<boolean> {
    return this.signedByAddress === authorization
  }

  /** Whether signature is attached to transaction (and/or whether the signature is correct)
   * If a specific action.from is specifed, ensure that attached signature matches its address/public key */
  public get hasAllRequiredSignatures(): boolean {
    // if action.from exists, make sure it matches the attached signature
    if (!this.isFromEmptyOrNullAddress()) {
      return this.signedByAddress === this.action?.from
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
   *  If no action.from is set, and no signature attached, throws an error since from addr cant be determined
   *  Throws if action.from is not a valid address */
  public get missingSignatures(): EthereumAddress[] {
    this.assertIsValidated()
    if (isNullOrEmpty(this.requiredAuthorization)) {
      throwNewError('Cant determine signatures required - set a from address or attach a signature')
    }
    return this.hasAllRequiredSignatures ? null : [this.requiredAuthorization] // if no values, return null instead of empty array
  }

  // Fees

  /** Ethereum has a fee for transactions */
  public get supportsFee(): boolean {
    return true
  }

  /** Gets estimated cost in units of gas to execute this transaction (at current chain rates) */
  public async resourcesRequired(): Promise<EthereumTransactionResources> {
    let gas: string
    this.assertHasAction()
    this.assertFromIsValid()
    try {
      const trxOptions = this.getOptionsForEthereumJsTx()
      const input = {
        to: isNullOrEmptyEthereumValue(this.action.to) ? null : this.action.to,
        from: this.senderAddress, // from is required for estimateGas
        value: isNullOrEmptyEthereumValue(this.action.value) ? 0 : this.action.value,
        data: isNullOrEmptyEthereumValue(this.action.data) ? null : this.action.data,
        chain: trxOptions?.chain,
        fork: trxOptions.hardfork,
      }
      gas = (await this._chainState.web3.eth.estimateGas(input)).toString()
      this._estimatedGas = gas
    } catch (err) {
      throwNewError(`ResourcesRequired failure. ${err}`)
    }
    return { gas }
  }

  /** Gets the estimated cost for this transaction
   *  if refresh = true, get updated cost from chain */
  async getEstimatedGas(refresh: boolean = false) {
    if (isNullOrEmpty(this._estimatedGas) || refresh) {
      await this.resourcesRequired()
    }
    return this._estimatedGas
  }

  /** Get the suggested Eth fee (in Ether) for this transaction */
  public async getSuggestedFee(
    priority: EthereumTxExecutionPriority = EthereumTxExecutionPriority.Average,
  ): Promise<string> {
    this.assertHasAction()
    const gasPriceString = await this._chainState.getCurrentGasPriceFromChain()
    let gasPriceinWeiBN = new BN(gasPriceString)
    const multiplier: number = TRANSACTION_FEE_PRIORITY_MULTIPLIERS[priority]
    gasPriceinWeiBN = gasPriceinWeiBN.muln(multiplier)
    const totalFee = gasPriceinWeiBN.mul(new BN(await this.getEstimatedGas(), 10))
    return convertEthUnit(totalFee.toString(10), EthUnit.Wei, EthUnit.Ether)
  }

  /** get the desired fee (in Ether) to spend on sending the transaction */
  public async getDesiredFee(): Promise<string> {
    return convertEthUnit(this._desiredFee, EthUnit.Wei, EthUnit.Ether)
  }

  /** set the fee that you would like to pay (in Ether) - this will set the gasPrice and gasLimit (based on maxFeeIncreasePercentage) */
  public async setDesiredFee(desiredFee: string) {
    const desiredFeeWei = toWeiString(desiredFee, EthUnit.Ether)
    const gasRequired = new BN((await this.resourcesRequired())?.gas, 10)
    const desiredFeeBn = new BN(desiredFeeWei, 10)
    const gasPriceBn = desiredFeeBn.div(gasRequired)
    this._desiredFee = desiredFeeWei
    const gasPriceString = gasPriceBn.toString(10).slice(0, -9)
    const gasRequiredInt = parseInt(gasRequired.toString(10), 10)
    const gasLimitString = (gasRequiredInt * (1 + this.maxFeeIncreasePercentage / 100)).toString()
    this._actionHelper.gasPrice = gasPriceString
    this._actionHelper.gasLimit = gasLimitString
    this.updateEthTxFromAction()
  }

  /** Hash of transaction - signature must be present to determine transactionId */
  public get transactionId(): string {
    if (!this.hasAnySignatures) {
      throwNewError('Cant determine transaction ID - missing transaction signature')
    }
    return ensureHexPrefix(this._ethereumJsTx.hash(true).toString('hex'))
  }

  /** get the actual cost (in Ether) for sending the transaction */
  public async getActualCost(): Promise<string> {
    if (!isNullOrEmptyEthereumValue(this._actualCost)) {
      return this._actualCost
    }
    const transaction = await this._chainState.web3.eth.getTransactionReceipt(this.transactionId)
    if (!transaction?.gasUsed) {
      throw new Error('Cant retrieve actual cost - Transaction not found on chain')
    }
    this._actualCost = (parseInt(this.action.gasPrice, 16) * transaction?.gasUsed).toString(10)
    return convertEthUnit(this._actualCost, EthUnit.Wei, EthUnit.Ether)
  }

  /** get the estimated cost for sending the transaction */
  public async getEstimatedCost(refresh: boolean = false): Promise<EthereumTransactionCost> {
    return { fee: await this.getEstimatedGas(refresh) }
  }

  public get maxFeeIncreasePercentage(): number {
    return this._maxFeeIncreasePercentage || 0
  }

  /** The maximum percentage increase over the desiredGas */
  public set maxFeeIncreasePercentage(percentage: number) {
    if (percentage < 0) {
      throwNewError('maxFeeIncreasePercentage can not be a negative value')
    }
    this._maxFeeIncreasePercentage = percentage
  }

  /** throws if required fee properties aren't set */
  private assertHasFeeSetting(): void {
    if (isNullOrEmpty(this._maxFeeIncreasePercentage)) {
      throwNewError('MaxFeeIncreasePercentage must be set (included in Transaction options or set directly)')
    }
  }

  /** Get the execution priority for the transaction - higher value attaches more fees */
  public get executionPriority(): EthereumTxExecutionPriority {
    return this._executionPriority
  }

  public set executionPriority(value: EthereumTxExecutionPriority) {
    this._executionPriority = value
  }

  // Authorizations

  /** Returns address specified by actions[].from property
   * throws if actions[].from is not a valid address - needed to determine the required signature */
  public get requiredAuthorizations(): EthereumAddress[] {
    return [this.requiredAuthorization]
  }

  /** Return the one signature address required */
  private get requiredAuthorization(): EthereumAddress {
    this.assertIsValidated()
    this.assertFromIsValid()
    return this.senderAddress
  }

  /** set transaction hash to sign */
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
    const privateKeyBuffer = toEthBuffer(privateKey)
    // generate nonce (using privateKey) if not already present
    await this.setNonceIfEmpty(bufferToHex(privateToAddress(privateKeyBuffer)))
    this._ethereumJsTx?.sign(privateKeyBuffer)
  }

  // send

  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block before returning */
  public async send(
    waitForConfirm: ConfirmType = ConfirmType.None,
    communicationSettings?: EthereumChainSettingsCommunicationSettings,
  ): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    // Serialize the entire transaction for sending to chain (prepared transaction that includes signatures { v, r , s })
    const signedTransaction = bufferToHex(this._ethereumJsTx.serialize())
    const response = await this._chainState.sendTransaction(signedTransaction, waitForConfirm, communicationSettings)
    return response
  }

  // helpers

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Throws if not validated */
  private assertIsValidated(): void {
    this.assertIsConnected()
    this.assertHasRaw()
    if (!this._isValidated) {
      throwNewError('Transaction not validated. Call transaction.validate() first.')
    }
  }

  /** Whether action.from (if present) is a valid ethereum address - also checks that from is provided if data was */
  private assertFromIsValid(): void {
    // if data is provided in the action, then there must be a from value
    if (!isNullOrEmptyEthereumValue(this?.action?.data) && isNullOrEmptyEthereumValue(this?.action?.from)) {
      throwNewError('Transaction action.from must be provided to call a contract (since action.data was provided).')
    }
    if (!this.isFromEmptyOrNullAddress() && !isValidEthereumAddress(this?.action?.from)) {
      throwNewError('Transaction action.from address is not valid.')
    }
  }

  /** Throws if an action isn't attached to this transaction */
  private assertHasAction() {
    if (isNullOrEmpty(this._actionHelper)) {
      throwNewError('Transaction has no action. You can set the action using transaction.actions or setFromRaw().')
    }
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRaw) {
      throwNewError('Transaction doesnt have a transaction body. Set action or use setFromRaw().')
    }
  }

  private isFromAValidAddressOrEmpty(): boolean {
    return this.isFromEmptyOrNullAddress() || isValidEthereumAddress(this?.action?.from)
  }

  /** Whether the from address is null or empty */
  private isFromEmptyOrNullAddress(): boolean {
    return isNullOrEmptyEthereumValue(this?.action?.from)
  }

  getOptionsForEthereumJsTx() {
    const { chainForkType } = this._chainState?.chainSettings || {}
    if (isNullOrEmpty(chainForkType)) {
      throwNewError('Missing chainForkType settings in Ethereum chain settings')
    }
    return { chain: chainForkType?.chainName, hardfork: chainForkType?.hardFork }
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
