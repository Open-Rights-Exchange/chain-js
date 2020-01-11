/* eslint-disable @typescript-eslint/no-unused-vars */
import { EthereumChainState } from './ethChainState'
import { Transaction } from '../../interfaces'
import { ConfirmType, TransactionOptions } from '../../models'
import { throwNewError } from '../../errors'
import { isNullOrEmpty, getUniqueValues } from '../../helpers'

export class EthereumTransaction implements Transaction {
  private _cachedAccounts: any[] = []

  private _actions: any[]

  private _chainState: EthereumChainState

  private _header: any

  private _options: TransactionOptions

  private _signatures: Set<any> // A set keeps only unique values

  private _serialized: Uint8Array

  private _signBuffer: Buffer

  private _requiredAuthorizations: any[]

  private _isValidated: boolean

  constructor(chainState: EthereumChainState, options?: TransactionOptions) {
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
    const { blocksBehind, expireSeconds } = this._options
    const transactOptions = { broadcast: false, sign: false, blocksBehind, expireSeconds }
    const serializedTransaction = new Uint8Array() // TODO
    this.setHeaderFromSerialized(serializedTransaction)
    this.setSignBuffer()
  }

  /** Extract header from serialized transaction body */
  private setHeaderFromSerialized(serializedTransaction: Uint8Array): void {
    const deserialized = {} // TODO
    this._header = deserialized
  }

  // TODO
  async setSerialized(serialized: any): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (serialized) {
      const { actions: txActions, deserializedTransaction: txHeader } = await this.deserializeWithActions(serialized)
      this._header = txHeader
      this._actions = txActions
      this._serialized = serialized
      this._isValidated = false
      this.setSignBuffer()
    }
  }

  /** Creates a sign buffer using serialized transaction body */
  // TODO
  private setSignBuffer() {
    this.assertIsConnected()
    this._signBuffer = Buffer.concat([
      Buffer.from(this._chainState?.chainId, 'hex'),
      Buffer.from(this._serialized),
      Buffer.from(new Uint8Array(32)),
    ])
  }

  /** Deserializes the transaction header and actions - fetches from the chain to deserialize action data */
  private async deserializeWithActions(serializedTransaction: Uint8Array | string): Promise<any> {
    this.assertIsConnected()
    const { actions, ...deserializedTransaction } = { actions: {}, deserializedTransaction: {} } // TODO
    return { actions, deserializedTransaction }
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

  public addAction(action: any, asFirstAction: boolean = false): void {
    this.assertNoSignatures()
    if (!action) {
      throwNewError('Action parameter is missing')
    }
    let newActions = this._actions ?? []
    if (asFirstAction) {
      newActions = [action, ...this._actions]
    } else {
      newActions.push(action)
    }
    this._actions = newActions
  }

  // validation

  public async validate(): Promise<void> {
    if (!this.hasSerialized) {
      throwNewError(
        'Transaction validation failure. Missing serialized transaction. Use setSerialized() or if setting actions, call transaction.generateSerialized().',
      )
    }
    // this will throw an error if an account in transaction body doesn't exist on chain
    this._requiredAuthorizations = await this.fetchAuthorizationsRequired()
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

  addSignature(signature: any): void {
    this.assertValidSignature(signature)
    if (this._signatures) {
      this._signatures.add(signature)
    } else {
      this._signatures = new Set<any>([signature])
    }
  }

  private assertValidSignature = (signature: any) => {
    // if(!isValidEthSignature(signature)) {
    //   throwAndLogError(`Not a valid signature : ${signature}`, 'signature_invalid')
    // }
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

  public async hasSignatureForAuthorization(authorization: any): Promise<boolean> {
    const { account, permission } = authorization
    let { publicKey } = authorization
    if (!authorization.publicKey) {
      publicKey = await this.getPublicKeyForAuthorization(account, permission)
    }
    return this.hasSignatureForPublicKey(publicKey)
  }

  public get signBuffer(): Buffer {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    return this._signBuffer
  }

  public sign(privateKeys: any[]): void {
    this.assertIsValidated()
    // privateKeys.forEach(pk => {
    //   if(!isValidEosPrivateKey) { throwNewError(`Sign Transaction Failure - Private key :${pk} is not valid EOS private key`)}
    // })
    // sign the signBuffer using the private key
    // privateKeys.forEach(pk => {
    //   let signature = cryptoSign(this._signBuffer, pk)
    //   this.addSignature(signature)
    // })
  }

  // authorizations

  get requiredAuthorizations() {
    this.assertIsValidated()
    return this._requiredAuthorizations
  }

  private async fetchAuthorizationsRequired(): Promise<any[]> {
    const requiredAuths = new Set<any>()
    const actions = this._actions
    // collect unique set of account/permission for all actions in transaction
    if (actions) {
      actions
        .map(action => action.authorization)
        .forEach(auths => {
          auths.forEach((auth: any) => {
            const { actor: account, permission } = auth
            requiredAuths.add({ account, permission })
          })
        })
    }
    // get the unique set of account/permissions
    const requiredAuthsArray = getUniqueValues<any>(Array.from(requiredAuths))
    // attach public keys for each account/permission - fetches accounts from chain where necessary
    return this.addPublicKeysToAuths(requiredAuthsArray)
  }

  /** Fetch the public key (from the chain) for the provided account and permission */
  private async getPublicKeyForAuthorization(accountName: string, permissionName: string) {
    const account = await this.getAccount(accountName)
    const permission = account?.permissions.find((p: any) => p.name === permissionName)
    return permission?.publicKey
  }

  /** Fetches account names from the chain (and adds to private cache) */
  private async getAccount(accountName: string) {
    const account = this._cachedAccounts.find(ca => accountName === ca.name)
    // if(!account) {
    //   account = new EthereumAccount(this._chainState);
    //   await account.fetchFromChain(accountName);
    //   this._cachedAccounts.push(account);
    // };
    return account
  }

  /** Fetches public keys (from the chain) for each account/permission pair
   *   Fetches accounts from the chain (if not already cached)
   */
  private async addPublicKeysToAuths(auths: any[]) {
    const returnedAuth: any[] = []
    const keysToGet = auths.map(async auth => {
      const publicKey = await this.getPublicKeyForAuthorization(auth.account, auth.permission)
      returnedAuth.push({ ...auth, publicKey })
    })
    await Promise.all(keysToGet)
    return returnedAuth
  }

  // send

  public send(waitForConfirm: ConfirmType = ConfirmType.None): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    const signedTransaction = { signatures: this.signatures, serializedTransaction: this._serialized }
    return this._chainState.sendTransaction(this._serialized, this.signatures, waitForConfirm)
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
