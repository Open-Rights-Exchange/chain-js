import { hexToUint8Array } from 'eosjs/dist/eosjs-serialize'
import { EosAccount } from './eosAccount'
import { EosChainState } from './eosChainState'
import { getPublicKeyFromSignature, sign as cryptoSign } from './eosCrypto'
import { isValidEosSignature, isValidEosPrivateKey, toEosPublicKey } from './helpers'
import {
  EosAuthorization,
  EosActionStruct,
  EosPublicKey,
  EosEntityName,
  EosSignature,
  EosPrivateKey,
  EosTransactionOptions,
} from './models'
import { isAString, isAnObject, isNullOrEmpty, getUniqueValues, notSupported, notImplemented } from '../../helpers'
import { throwAndLogError, throwNewError } from '../../errors'
import { ChainSettingsCommunicationSettings, ConfirmType } from '../../models'
import { Transaction } from '../../interfaces'

export type PublicKeyMapCache = {
  accountName: EosEntityName
  permissionName: EosEntityName
  publicKey: EosPublicKey
}

export class EosTransaction implements Transaction {
  private _publicKeyMap: PublicKeyMapCache[] = []

  private _cachedAccounts: EosAccount[] = []

  private _actions: EosActionStruct[]

  private _chainState: EosChainState

  private _header: any

  private _options: EosTransactionOptions

  private _signatures: Set<EosSignature> // A set keeps only unique values

  /** Transaction prepared for signing (raw transaction) */
  private _raw: Uint8Array

  private _sendReceipt: any

  private _signBuffer: Buffer

  private _requiredAuthorizations: EosAuthorization[]

  private _isValidated: boolean

  private _transactionId: string

  constructor(chainState: EosChainState, options?: EosTransactionOptions) {
    this._chainState = chainState
    let { blocksBehind, expireSeconds } = options || {}
    blocksBehind = blocksBehind ?? this._chainState?.chainSettings?.defaultTransactionSettings?.blocksBehind
    expireSeconds = expireSeconds ?? this._chainState?.chainSettings?.defaultTransactionSettings?.expireSeconds
    this._options = { blocksBehind, expireSeconds }
  }

  public async init(): Promise<void> {
    return null
  }

  // header

  /** The header that is included when the transaction is sent to the chain
   *  It is part of the transaction body (in the signBuffer) which is signed
   *  The header changes every time prepareToBeSigned() is called since it includes latest block time, etc.
   */
  get header() {
    return this._header
  }

  /** The options provided when the transaction class was created */
  get options() {
    return this._options
  }

  /** The transaction body in raw format (by prepareForSigning) */
  get raw() {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction has not been prepared to be signed yet. Call prepareToBeSigned() or use setFromRaw(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
    return this._raw
  }

  /** Whether parent transaction has been set yet */
  public get hasParentTransaction(): boolean {
    return false // Currently always false for Eos (multisig doesnt require it)
  }

  /** Whether the raw transaction has been prepared */
  get hasRaw(): boolean {
    return !!this._raw
  }

  /** Wether a transaction must be wrapped in a parent transaction */
  public get requiresParentTransaction(): boolean {
    return false // Currently always false for Eos (multisig doesnt require it)
  }

  get sendReceipt() {
    return this._sendReceipt
  }

  /** TODO: Implement support for eos multi-sig transactions */
  get supportsMultisigTransaction(): boolean {
    return false
  }

  /** Parent transaction is what gets sent to chain
   * Note: Eos doesnt use a parent transaction */
  public getParentTransaction(): Promise<EosTransaction> {
    return notSupported('Eos doesnt use a parent transaction')
  }

  /** Generate the raw transaction body using the actions attached
   *  Also adds a header to the transaction that is included when transaction is signed
   */
  public async prepareToBeSigned(): Promise<void> {
    this.assertIsConnected()
    // if prepared (raw) transaction already exists, then dont do it again
    if (this._raw) {
      return
    }
    this.assertNoSignatures()
    if (!this._actions) {
      throwNewError('Transaction serialization failure. Transaction has no actions.')
    }
    const { blocksBehind, expireSeconds } = this._options
    const transactOptions = { broadcast: false, sign: false, blocksBehind, expireSeconds }
    const { serializedTransaction: rawTransaction } = await this._chainState.api.transact(
      { actions: this._actions },
      transactOptions,
    )
    this._raw = this.rawToUint8Array(rawTransaction)
    this.setHeaderFromRaw(rawTransaction)
    this.setSignBuffer()
    // TODO: consider how to setTransactionId()
  }

  /** Extract header from raw transaction body (eosjs refers to raw as serialized) */
  private setHeaderFromRaw(rawTransaction: Uint8Array): void {
    // deserializeTransaction does not call the chain - just deserializes transation header and action names (not action data)
    const deRawified = this._chainState.api.deserializeTransaction(rawTransaction)
    delete deRawified.actions // remove parially deRawified actions
    this._header = deRawified
  }

  /** Set the body of the transaction using Hex raw transaction data
   *  This is one of the ways to set the actions for the transaction
   *  Sets transaction data from raw transaction - supports both raw/serialized formats (JSON bytes array and hex)
   *  This is an ASYNC call since it fetches (cached) action contract schema from chain in order to deserialize action data */
  async setFromRaw(raw: any): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (raw) {
      // if raw is passed-in as a JSON array of bytes, convert it to Uint8Array
      const useRaw = this.rawToUint8Array(raw)
      const { actions: txActions, deRawifiedTransaction: txHeader } = await this.deRawifyWithActions(useRaw)
      this._header = txHeader
      this._actions = txActions
      this._raw = useRaw
      this._isValidated = false
      this.setSignBuffer()
    }
  }

  /** Creates a sign buffer using raw transaction body */
  private setSignBuffer() {
    this.assertIsConnected()
    this._signBuffer = Buffer.concat([
      Buffer.from(this._chainState?.chainId, 'hex'),
      Buffer.from(this._raw),
      Buffer.from(new Uint8Array(32)),
    ])
  }

  /** Deserializes the transaction header and actions - fetches from the chain to deserialize action data */
  private async deRawifyWithActions(rawTransaction: Uint8Array | string): Promise<any> {
    this.assertIsConnected()
    const { actions, ...deRawifiedTransaction } = await this._chainState.api.deserializeTransactionWithActions(
      rawTransaction,
    )
    return { actions, deRawifiedTransaction }
  }

  // actions

  /** The contract actions executed by the transaction */
  public get actions() {
    return this._actions
  }

  /** Sets the Array of actions */
  public set actions(actions: EosActionStruct[]) {
    this.assertNoSignatures()
    if (isNullOrEmpty(actions) || !Array.isArray(actions)) {
      throwNewError('actions must be an array and have at least one value')
    }
    this._actions = actions
    this._isValidated = false
  }

  /** Add one action to the transaction body
   *  Setting asFirstAction = true places the new transaction at the top */
  public addAction(action: EosActionStruct, asFirstAction: boolean = false): void {
    this.assertNoSignatures()
    if (!action) {
      throwNewError('Action parameter is missing')
    }
    let newActions = this._actions ?? []
    if (asFirstAction) {
      newActions = [action, ...(this._actions || [])]
    } else {
      newActions.push(action)
    }
    this._actions = newActions
    this._isValidated = false
  }

  // validation

  /** Verifies that all accounts and permisison for actions exist on chain.
   *  Throws if any problems */
  public async validate(): Promise<void> {
    if (!this.hasRaw) {
      throwNewError(
        'Transaction validation failure. Missing raw transaction. Use setFromRaw() or if setting actions, call transaction.prepareToBeSigned().',
      )
    }
    // this will throw an error if an account in transaction body doesn't exist on chain
    this._requiredAuthorizations = await this.fetchAuthorizationsRequired()
    this._isValidated = true
  }

  // ** Whether transaction has been validated - via vaidate() */
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
  /** Signatures attached to transaction */
  get signatures(): EosSignature[] {
    if (isNullOrEmpty(this._signatures)) return null
    return [...this._signatures]
  }

  /** Sets the Set of signatures */
  set signatures(signatures: EosSignature[]) {
    signatures.forEach(sig => {
      this.assertValidSignature(sig)
    })
    this._signatures = new Set<EosSignature>(signatures)
  }

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  addSignatures(signatures: EosSignature[]): void {
    if (isNullOrEmpty(signatures)) return
    signatures.forEach(signature => {
      this.assertValidSignature(signature)
    })
    const newSignatures = new Set<EosSignature>()
    signatures.forEach(signature => {
      newSignatures.add(signature)
    })
    // add to existing collection of signatures
    this._signatures = new Set<EosSignature>([...(this._signatures || []), ...newSignatures])
  }

  /** Throws if signatures isn't properly formatted */
  private assertValidSignature = (signature: EosSignature) => {
    if (!isValidEosSignature(signature)) {
      throwAndLogError(`Not a valid signature : ${signature}`, 'signature_invalid')
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

  // TODO: Fix this logic - should evaluate the weights of keys in each EOSAuthorization
  // As written, the assumption is that if a public key is in the auth, it is required, but no neccesarily - if the threshold is already met with existing keys
  /** Whether there is an attached signature for every authorization (e.g. account/permission) in all actions */
  public get hasAllRequiredSignatures(): boolean {
    this.assertIsValidated()
    const hasAllSignatures = this._requiredAuthorizations?.every(auth => this.hasSignatureForPublicKey(auth.publicKey))
    return hasAllSignatures
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    if (!this.hasAllRequiredSignatures) {
      throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  /** An array of authorizations (e.g. account/permission) that do not have an attached signature
   *  Retuns null if no signatures are missing */
  public get missingSignatures(): EosAuthorization[] {
    this.assertIsValidated()
    const missing = this._requiredAuthorizations?.filter(auth => !this.hasSignatureForPublicKey(auth.publicKey))
    return isNullOrEmpty(missing) ? null : missing // if no values, return null instead of empty array
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey(publicKey: EosPublicKey): boolean {
    const sigsToLoop = this.signatures || []
    return sigsToLoop.some(signature => {
      const pk = getPublicKeyFromSignature(signature, this._signBuffer)
      return pk === publicKey
    })
  }

  /** Whether there is an attached signature for the publicKey for the authoization (e.g. account/permission)
   *  May need to call chain (async) to fetch publicKey(s) for authorization(s) */
  public async hasSignatureForAuthorization(authorization: EosAuthorization): Promise<boolean> {
    const { account, permission } = authorization
    let { publicKey } = authorization
    if (!authorization.publicKey) {
      publicKey = await this.getPublicKeyForAuthorization(account, permission)
    }
    return this.hasSignatureForPublicKey(publicKey)
  }

  /** The transaction data needed to create a transaction signature.
   *  It should be signed with a private key. */
  public get signBuffer(): Buffer {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    return this._signBuffer
  }

  /** TODO: Implement support for eos multi-sig transactions */
  public get isMultisig(): boolean {
    return false
  }

  /** Sign the transaction body with private key(s) and add to attached signatures */
  public sign(privateKeys: EosPrivateKey[]): Promise<void> {
    this.assertIsValidated()
    if (isNullOrEmpty(privateKeys)) return
    privateKeys.forEach(pk => {
      if (!isValidEosPrivateKey(pk)) {
        throwNewError(`Sign Transaction Failure - Private key :${pk} is not valid EOS private key`)
      }
    })
    // sign the signBuffer using the private key
    privateKeys.forEach(pk => {
      const signature = cryptoSign(this._signBuffer, pk)
      this.addSignatures([signature])
    })
  }

  private async setTransactionId(sendReceipt: Promise<any>) {
    const result = await sendReceipt
    this._transactionId = result?.transactionId
  }

  public get transactionId(): string {
    if (isNullOrEmpty(this._transactionId)) {
      return null
      // throwNewError('Transaction has to be sent to chain to retrieve transactioId')
    }
    return this._transactionId
  }

  // authorizations

  /** An array of the unique set of account/permission/publicKey for all actions in transaction
   *  Also fetches the related accounts from the chain (to get public keys)
   *  NOTE: EOS requires async fecting, thus this getter requires validate() to be called
   *        call fetchAuthorizationsRequired() if needed before validate() */
  get requiredAuthorizations() {
    this.assertIsValidated()
    return this._requiredAuthorizations
  }

  /** Collect unique set of account/permission for all actions in transaction
   * Retrieves public keys from the chain by retrieving account(s) when needed */
  public async fetchAuthorizationsRequired(): Promise<EosAuthorization[]> {
    const requiredAuths = new Set<EosAuthorization>()
    const actions = this._actions
    if (actions) {
      actions
        .map(action => action.authorization)
        .forEach(auths => {
          auths.forEach(auth => {
            const { actor: account, permission } = auth
            requiredAuths.add({ account, permission })
          })
        })
    }
    // get the unique set of account/permissions
    const requiredAuthsArray = getUniqueValues<EosAuthorization>(Array.from(requiredAuths))
    // attach public keys for each account/permission - fetches accounts from chain where necessary
    return this.addPublicKeysToAuths(requiredAuthsArray)
  }

  // TODO: This code only works if the firstPublicKey is the only required Key
  // ... this function and hasSignatureForAuthorization must be rewritten to look for weights
  // ... and the publicKeyCache approach needs to handle multiple keys per permission
  /** Fetch the public key (from the chain) for the provided account and permission
   *  Also caches permission/publicKey mappings - the cache can be set externally via appendPublicKeyCache
   */
  private async getPublicKeyForAuthorization(accountName: EosEntityName, permissionName: EosEntityName) {
    let publicKey
    const cachedPublicKey = (
      this._publicKeyMap.find(m => m.accountName === accountName && m.permissionName === permissionName) || {}
    ).publicKey
    if (cachedPublicKey) {
      publicKey = toEosPublicKey(cachedPublicKey)
    } else {
      const account = await this.getAccount(accountName)
      const permission = account?.permissions.find(p => p.name === permissionName)
      if (!permission?.firstPublicKey) {
        throwNewError(`Account ${accountName} doesn't have a permission named ${permissionName}.`)
      }
      publicKey = toEosPublicKey(permission?.firstPublicKey)
      // save key to map cache
      this.appendPublicKeyCache([{ accountName, permissionName, publicKey }])
    }
    return publicKey
  }

  /** Fetches account names from the chain (and adds to private cache) */
  private async getAccount(accountName: EosEntityName) {
    let account = this._cachedAccounts.find(ca => accountName === ca.name)
    if (!account) {
      account = new EosAccount(this._chainState)
      await account.load(accountName)
      this._cachedAccounts.push(account)
    }
    return account
  }

  /** Use an already fetched account instead of trying to refect from the chain
   *  Can improve performance
   *  Also neccessary for creating an inline transaction for an new account which isnt yet on the chain */
  async appendAccountToCache(account: EosAccount) {
    this._cachedAccounts.push(account)
  }

  /** Use an already fetched map of account/permission to public keys
   *  Can improve performance - otherwise this class needs to retrieve accounts from the chain
   *  Also neccessary for creating a new account which isnt yet on the chain */
  appendPublicKeyCache(publicKeysMap: PublicKeyMapCache[]): void {
    this._publicKeyMap = [...this._publicKeyMap, ...publicKeysMap]
  }

  /** Fetches public keys (from the chain) for each account/permission pair
   *   Fetches accounts from the chain (if not already cached)
   */
  private async addPublicKeysToAuths(auths: EosAuthorization[]) {
    const returnedAuth: EosAuthorization[] = []

    const keysToGet = auths.map(async auth => {
      const publicKey = await this.getPublicKeyForAuthorization(auth.account, auth.permission)
      returnedAuth.push({ ...auth, publicKey })
    })
    await Promise.all(keysToGet)
    return returnedAuth
  }

  // send
  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block (or irreversable block) before returning */
  public async send(
    waitForConfirm: ConfirmType = ConfirmType.None,
    communicationSettings?: ChainSettingsCommunicationSettings,
  ): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    const signedTransaction = { serializedTransaction: this._raw, signatures: this.signatures }
    this._sendReceipt = this._chainState.sendTransaction(signedTransaction, waitForConfirm, communicationSettings)
    this.setTransactionId(this._sendReceipt)
    return this._sendReceipt
  }

  // helpers

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** JSON representation of transaction data */
  public toJson(): any {
    return { ...this._header, actions: this._actions, signatures: this.signatures }
  }

  /** Accepts either an object where each value is the uint8 array value
   *     ex: {'0': 24, ... '3': 93 } => [24,241,213,93]
   *  OR a packed transaction as a string of hex bytes
   * */
  private rawToUint8Array = (rawTransaction: any): Uint8Array => {
    // if the trasaction data is a JSON array of bytes, convert to Uint8Array
    if (isAnObject(rawTransaction)) {
      const trxLength = Object.keys(rawTransaction).length
      let buf = new Uint8Array(trxLength)
      buf = Object.values(rawTransaction) as any // should be a Uint8Array in this value
      return buf
    }
    // if transaction is a packed transaction (string of bytes), convert it into an Uint8Array of bytes
    if (rawTransaction && isAString(rawTransaction)) {
      const deRawifiedTransaction = hexToUint8Array(rawTransaction)
      return deRawifiedTransaction
    }
    throw Error('Missing or malformed rawTransaction (rawToUint8Array)')
  }

  // Fees

  public get supportsFee() {
    return false
  }

  // TODO: to be implement
  public async resourcesRequired(): Promise<any> {
    notImplemented()
  }

  public async setDesiredFee(): Promise<any> {
    notSupported('setDesiredFee')
  }

  public async getSuggestedFee(): Promise<any> {
    notSupported('getSuggestedFee')
  }

  // TODO: to be implemented
  public async getActualCost(): Promise<any> {
    notImplemented()
  }

  // ------------------------ EOS Specific functionality -------------------------------
  // Put any EOS chain specific feature that aren't included in the standard Transaction interface below here  */
  // calling code can access these functions by first casting the generic object into an eos-specific flavor
  // e.g.   let eosTransaction = (transaction as EosTransaction);
  //        eosTransaction.anyEosSpecificFunction();

  /** Placeholder */
  public anyEosSpecificFunction = () => {}
}
