/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ConfirmType, TxExecutionPriority } from '../../models'
import { notImplemented } from '../../helpers'
import { Transaction } from '../../interfaces'
import { PolkadotSignature } from './models/cryptoModels'
import {
  PolkadotAddress,
  PolkadotPublicKey,
  PolkadotPrivateKey,
  PolkadotChainSettingsCommunicationSettings,
} from './models'
import {
  PolkadotAddressBuffer,
  PolkadotTransactionOptions,
  PolkadotRawTransaction,
  PolkadotTransactionHeader,
  PolkadotActionHelperInput,
  PolkadotTransactionAction,
  PolkadotTransactionCost,
  PolkadotSetDesiredFeeOptions,
  PolkadotTransactionResources,
} from './models/transactionModels'
import { PolkadotActionHelper } from './polkadotAction'
import { PolkadotChainState } from './polkadotChainState'

export class PolkadotTransaction implements Transaction {
  private _actionHelper: PolkadotActionHelper

  private _chainState: PolkadotChainState

  private _actualCost: string

  private _desiredFee: string

  /** estimated gas for transacton - encoded as string to handle big numbers */
  private _estimatedGas: string

  private _maxFeeIncreasePercentage: number

  private _isValidated: boolean

  private _options: PolkadotTransactionOptions

  private _signBuffer: Buffer

  constructor(chainState: PolkadotChainState, options?: PolkadotTransactionOptions) {
    this._chainState = chainState
    this._options = options
    this.applyDefaultOptions()
  }

  private applyDefaultOptions() {
    notImplemented()
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
    notImplemented()
    return ''
  }

  /** Address retrieved from attached signature - Returns null if no signature attached */
  get signedByAddress(): PolkadotAddress {
    notImplemented()
    return null
  }

  /** Public Key retrieved from attached signature - Returns null if no from value or signature attached */
  get signedByPublicKey(): PolkadotPublicKey {
    notImplemented()
    return null
  }

  /** Header includes values included in transaction when sent to the chain
   *  These values are set by setRawProperties() is called since it includes gasPrice, gasLimit, etc.
   */
  get header(): PolkadotTransactionHeader {
    notImplemented()
    return null
  }

  /** Options provided when the transaction class was created */
  get options() {
    return this._options
  }

  /** Raw transaction body - all values are Buffer types */
  get raw(): PolkadotRawTransaction {
    notImplemented()
    return null
  }

  /** Whether the raw transaction body has been set (via setting action or setFromRaw()) */
  get hasRaw(): boolean {
    notImplemented()
    return false
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
    notImplemented()
  }

  /** update locally cached EthereumJsTx from action helper data */
  updateEthTxFromAction() {
    notImplemented()
  }

  /**
   *  Updates nonce and gas fees (if necessary) - these values must be present
   */
  public async prepareToBeSigned(): Promise<void> {
    notImplemented()
    return null
  }

  /** Set the body of the transaction using Hex raw transaction data */
  async setFromRaw(raw: PolkadotActionHelperInput): Promise<void> {
    notImplemented()
    return null
  }

  /** Creates a sign buffer using raw transaction body */
  private setSignBuffer() {
    notImplemented()
  }

  /** calculates a unique nonce value for the tx (if not already set) by using the chain transaction count for a given address */
  async setNonceIfEmpty(fromAddress: PolkadotAddress | PolkadotAddressBuffer) {
    notImplemented()
  }

  /** Ethereum transaction action (transfer & contract functions)
   * Returns null or an array with exactly one action
   */
  public get actions(): PolkadotTransactionAction[] {
    notImplemented()
    return null
  }

  /** Private property for the Ethereum contract action - uses _actionHelper */
  private get action(): PolkadotTransactionAction {
    notImplemented()
    return null
  }

  /** Sets actions array
   * Array length has to be exactly 1 because ethereum doesn't support multiple actions
   */
  public set actions(actions: PolkadotTransactionAction[]) {
    notImplemented()
  }

  /** Add action to the transaction body
   *  throws if transaction.actions already has a value
   *  Ignores asFirstAction parameter since only one action is supported in ethereum */
  public addAction(action: PolkadotTransactionAction, asFirstAction?: boolean): void {
    notImplemented()
  }

  // validation

  /** Verifies that raw trx exists, sets nonce (using sender's address) if not already set
   *  Throws if any problems */
  public async validate(): Promise<void> {
    notImplemented()
  }

  // signatures

  /** Get signature attached to transaction - returns null if no signature */
  get signatures(): PolkadotSignature[] {
    notImplemented()
    return null
  }

  /** Sets the Set of signatures */
  set signatures(signatures: PolkadotSignature[]) {
    notImplemented()
  }

  /** Add signature to raw transaction - Accepts array with exactly one signature */
  addSignatures = (signatures: PolkadotSignature[]): void => {
    notImplemented()
  }

  /** Throws if signatures isn't properly formatted */
  private assertValidSignature = (signature: PolkadotSignature) => {
    notImplemented()
  }

  /** Whether there is an attached signature */
  get hasAnySignatures(): boolean {
    notImplemented()
    return false
  }

  /** Throws if any signatures are attached */
  private assertNoSignatures() {
    notImplemented()
  }

  /** Throws if transaction is missing any signatures */
  private assertHasSignature(): void {
    notImplemented()
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey = (publicKey: PolkadotPublicKey): boolean => {
    notImplemented()
    return false
  }

  /** Whether there is an attached signature for the publicKey of the address */
  public async hasSignatureForAuthorization(authorization: PolkadotAddress): Promise<boolean> {
    notImplemented()
    return false
  }

  /** Whether signature is attached to transaction (and/or whether the signature is correct)
   * If a specific action.from is specifed, ensure that attached signature matches its address/public key */
  public get hasAllRequiredSignatures(): boolean {
    notImplemented()
    return false
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    notImplemented()
  }

  /** Returns address, for which, a matching signature must be attached to transaction
   *  ... always an array of length 1 because ethereum only supports one signature
   *  If no action.from is set, and no signature attached, throws an error since from addr cant be determined
   *  Throws if action.from is not a valid address */
  public get missingSignatures(): PolkadotAddress[] {
    notImplemented()
    return null
  }

  // Fees

  /** Ethereum has a fee for transactions */
  public get supportsFee(): boolean {
    return true
  }

  /** Gets estimated cost in units of gas to execute this transaction (at current chain rates) */
  public async resourcesRequired(): Promise<PolkadotTransactionResources> {
    notImplemented()
    return null
  }

  /** Gets the estimated cost for this transaction
   *  if refresh = true, get updated cost from chain */
  async getEstimatedGas(refresh: boolean = false) {
    notImplemented()
    return 0
  }

  /** Get the suggested Eth fee (in Ether) for this transaction */
  public async getSuggestedFee(priority: TxExecutionPriority = TxExecutionPriority.Average): Promise<string> {
    notImplemented()
    return null
  }

  /** get the desired fee (in Ether) to spend on sending the transaction */
  public async getDesiredFee(): Promise<string> {
    notImplemented()
    return null
  }

  /** set the fee that you would like to pay (in Ether) - this will set the gasPrice and gasLimit (based on maxFeeIncreasePercentage)
   *  If gasLimitOverride is provided, gasPrice will be calculated and gasLimit will be set to gasLimitOverride
   * */
  public async setDesiredFee(desiredFee: string, options?: PolkadotSetDesiredFeeOptions) {
    notImplemented()
  }

  /** Hash of transaction - signature must be present to determine transactionId */
  public get transactionId(): string {
    notImplemented()
    return null
  }

  /** get the actual cost (in Ether) for executing the transaction */
  public async getActualCost(): Promise<string> {
    notImplemented()
    return null
  }

  /** get the estimated cost for sending the transaction */
  public async getEstimatedCost(refresh: boolean = false): Promise<PolkadotTransactionCost> {
    notImplemented()
    return null
  }

  public get maxFeeIncreasePercentage(): number {
    return this._maxFeeIncreasePercentage || 0
  }

  /** The maximum percentage increase over the desiredGas */
  public set maxFeeIncreasePercentage(percentage: number) {
    notImplemented()
  }

  /** throws if required fee properties aren't set */
  private assertHasFeeSetting(): void {
    notImplemented()
  }

  /** Get the execution priority for the transaction - higher value attaches more fees */
  public get executionPriority(): TxExecutionPriority {
    notImplemented()
    return null
  }

  public set executionPriority(value: TxExecutionPriority) {
    notImplemented()
  }

  // Authorizations

  /** Returns address specified by actions[].from property
   * throws if actions[].from is not a valid address - needed to determine the required signature */
  public get requiredAuthorizations(): PolkadotAddress[] {
    notImplemented()
    return null
  }

  /** Return the one signature address required */
  private get requiredAuthorization(): PolkadotAddress {
    notImplemented()
    return null
  }

  /** set transaction hash to sign */
  public get signBuffer(): Buffer {
    notImplemented()
    return null
  }

  /** Sign the transaction body with private key and add to attached signatures */
  public async sign(privateKeys: PolkadotPrivateKey[]): Promise<void> {
    notImplemented()
    return null
  }

  // send

  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block before returning */
  public async send(
    waitForConfirm: ConfirmType = ConfirmType.None,
    communicationSettings?: PolkadotChainSettingsCommunicationSettings,
  ): Promise<any> {
    notImplemented()
    return null
  }

  // helpers

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    notImplemented()
  }

  /** Throws if not validated */
  private assertIsValidated(): void {
    notImplemented()
  }

  /** Whether action.from (if present) is a valid ethereum address - also checks that from is provided if data was */
  private assertFromIsValid(): void {
    notImplemented()
  }

  /** Throws if an action isn't attached to this transaction */
  private assertHasAction() {
    notImplemented()
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    notImplemented()
  }

  private isFromAValidAddressOrEmpty(): boolean {
    notImplemented()
    return false
  }

  /** Whether the from address is null or empty */
  private isFromEmptyOrNullAddress(): boolean {
    notImplemented()
    return false
  }

  getOptionsForEthereumJsTx() {
    notImplemented()
    return ''
  }

  /** JSON representation of transaction data */
  public toJson(): any {
    return { header: this.header, actions: this.actions, raw: this.raw, signatures: this.signatures }
  }
}
