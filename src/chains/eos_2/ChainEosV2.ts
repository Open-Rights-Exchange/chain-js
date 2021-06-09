import { RpcError } from 'eosjs'
import {
  ChainActionType,
  ChainDate,
  ChainEntityName,
  ChainInfo,
  ChainType,
  CryptoCurve,
  PrivateKey,
  PublicKey,
  Signature,
  TransactionOptions,
} from '../../models'
import { NATIVE_CHAIN_TOKEN_SYMBOL, NATIVE_CHAIN_TOKEN_ADDRESS } from './eosConstants'
import { Chain } from '../../interfaces'
import { ChainError, throwNewError } from '../../errors'
import * as eoscrypto from './eosCrypto'
import { EosChainState } from './eosChainState'
import { mapChainError } from './eosErrors'
import { composeAction } from './eosCompose'
import { decomposeAction } from './eosDecompose'
import { EosTransaction } from './eosTransaction'
import { EosCreateAccount } from './eosCreateAccount'
import { EosAccount } from './eosAccount'
import {
  isValidEosPrivateKey,
  isValidEosPublicKey,
  toEosPublicKey,
  toEosPrivateKey,
  toEosSignature,
  isValidEosEntityName,
  isValidEosAsset,
  isValidEosDate,
  toEosEntityName,
  toEosAsset,
  toEosDate,
  toEosSymbol,
} from './helpers'
import { initializePlugin } from '../../helpers'
import {
  EosActionStruct,
  EosChainSettings,
  EosEntityName,
  EosDate,
  EosCreateAccountOptions,
  EosDecomposeReturn,
  EosChainEndpoint,
  EosSymbol,
} from './models'
import { Asymmetric } from '../../crypto'
import { ChainJsPlugin, ChainJsPluginOptions } from '../../interfaces/plugin'

/** Provides support for the EOS blockchain
 *  Provides EOS-specific implementations of the Chain interface
 *  Also includes some features only available on this platform */
class ChainEosV2 implements Chain {
  private _endpoints: EosChainEndpoint[]

  private _settings: EosChainSettings

  private _chainState: EosChainState

  private _plugins: ChainJsPlugin[]

  constructor(endpoints: EosChainEndpoint[], settings?: EosChainSettings) {
    this._endpoints = endpoints
    this._settings = settings
    this._chainState = new EosChainState(endpoints, settings)
  }

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */

  public connect(): Promise<void> {
    return this._chainState.connect()
  }

  /** Return unique chain ID string */
  public get chainId(): string {
    this.assertIsConnected()
    return this._chainState.chainId
  }

  /** Retrieve lastest chain info including head block number and time */
  public get chainInfo(): ChainInfo {
    this.assertIsConnected()
    return this._chainState.chainInfo
  }

  public get endpoints(): EosChainEndpoint[] {
    return this._endpoints
  }

  public get plugins(): ChainJsPlugin[] {
    return this._plugins
  }

  /** Returns chain native token symbol and default token contract address */
  public get nativeToken(): { defaultUnit: string; symbol: EosSymbol; tokenAddress: EosEntityName } {
    return {
      defaultUnit: NATIVE_CHAIN_TOKEN_SYMBOL, // EOS doesnt use a seperate unit for the token - just returning the EOS symbol
      symbol: toEosSymbol(NATIVE_CHAIN_TOKEN_SYMBOL),
      tokenAddress: toEosEntityName(NATIVE_CHAIN_TOKEN_ADDRESS),
    }
  }

  /** Get the token balance for an account from the chain
   *  If tokenAddress is not provided, uses eosio.token as default
   *  Returns a string representation of the value to accomodate large numbers */
  public async fetchBalance(
    account: EosEntityName,
    symbol: EosSymbol,
    tokenAddress: EosEntityName = this.nativeToken.tokenAddress,
  ): Promise<{ balance: string }> {
    return this._chainState.fetchBalance(account, symbol, tokenAddress)
  }

  /** Fetch data from an on-chain contract table */
  public async fetchContractData(
    contract: EosEntityName,
    table: string,
    owner: EosEntityName,
    indexNumber?: number,
    lowerRow?: number,
    upperRow?: number,
    limit?: number,
    reverseOrder?: boolean,
    showPayer?: boolean,
    keyType?: string,
  ): Promise<any> {
    return this._chainState.fetchContractData(
      contract,
      table,
      owner,
      indexNumber,
      lowerRow,
      upperRow,
      limit,
      reverseOrder,
      showPayer,
      keyType,
    )
  }

  /** Compose an object for a chain contract action */
  public composeAction = async (actionType: ChainActionType, args: any): Promise<EosActionStruct> => {
    return composeAction(actionType, args)
  }

  /** Decompose a contract action and return the action type (if any) and its data */
  public decomposeAction = async (action: EosActionStruct): Promise<EosDecomposeReturn[]> => {
    return decomposeAction(action)
  }

  /** Returns a chain Account class
   * Note: Does NOT create a new account - to create an account, use new.CreateAccount */
  private async newAccount(accountName?: EosEntityName): Promise<EosAccount> {
    this.assertIsConnected()
    const account = new EosAccount(this._chainState)
    if (accountName) {
      await account.load(accountName)
    }
    return account
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private async newCreateAccount(options?: EosCreateAccountOptions): Promise<EosCreateAccount> {
    this.assertIsConnected()
    const createAccount = new EosCreateAccount(this._chainState, options)
    await createAccount.init()
    return createAccount
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private async newTransaction(options?: TransactionOptions): Promise<EosTransaction> {
    this.assertIsConnected()
    const transaction = new EosTransaction(this._chainState, options)
    await transaction.init()
    return transaction
  }

  public new = {
    /** Returns a new chain Account object
     * If an account name is provided, it will be fetched from the chain and loaded into the returned account object
     * Note: Does NOT create a new account - to create an account, use new.CreateAccount */
    Account: this.newAccount.bind(this),
    /** Return a new CreateAccount object used to help with creating a new chain account */
    CreateAccount: this.newCreateAccount.bind(this),
    /** Return a chain Transaction object used to compose and send transactions */
    Transaction: this.newTransaction.bind(this),
  }

  // --------- Chain crytography functions */
  /** Primary cryptography curve used by this chain */
  cryptoCurve: CryptoCurve.Secp256k1

  /** Decrypts the encrypted value using a password, and optional parameters using AES algorithm and SHA256 hash function
   * Expects the encrypted value to be a stringified JSON object */
  decryptWithPassword = eoscrypto.decryptWithPassword

  /** Encrypts a string using a password and optional parameters using AES algorithm and SHA256 hash function
   * The returned, encrypted value is a stringified JSON object */
  encryptWithPassword = eoscrypto.encryptWithPassword

  /** Decrypts the encrypted value using a private key
   * The encrypted value is either a stringified JSON object or a JSON object
   * ... and must have been encrypted with the public key that matches the private ley provided */
  decryptWithPrivateKey = eoscrypto.decryptWithPrivateKey

  /** Encrypts a string using a public key
   * The encrypted result can be decrypted with the matching private key */
  encryptWithPublicKey = eoscrypto.encryptWithPublicKey

  /** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
   *  each pass uses a private keys from privateKeys array param
   *  put the keys in the same order as public keys provided to encryptWithPublicKeys() - they will be applied in the right (reverse) order
   *  The result is the decrypted string */
  decryptWithPrivateKeys = eoscrypto.decryptWithPrivateKeys

  /** Use assymmetric encryption with multiple public keys - wrapping with each
   *  Returns an array of results with the last one including the final cipertext
   *  Encrypts using publicKeys in the order they appear in the array */
  encryptWithPublicKeys = eoscrypto.encryptWithPublicKeys

  /** Returns a public key given a signature and the original data was signed */

  /** Returns a public key given a signature and the original data was signed */
  public getPublicKeyFromSignature = (
    signature: string | Buffer,
    data: string | Buffer,
    encoding: string,
  ): PublicKey => {
    return eoscrypto.getPublicKeyFromSignature(signature, data, encoding) as PublicKey
  }

  /** Generates and returns a new public/private key pair */
  generateKeyPair = eoscrypto.generateKeyPair

  /** Verifies that the value is a valid, stringified JSON encryption result */
  isSymEncryptedDataString = eoscrypto.isSymEncryptedDataString

  /** Ensures that the value comforms to a well-formed stringified JSON encryption result */
  toSymEncryptedDataString = eoscrypto.toSymEncryptedDataString

  /** Verifies that the value is a valid, stringified JSON asymmetric encryption result */
  isAsymEncryptedDataString = Asymmetric.isAsymEncryptedDataString

  /** Ensures that the value comforms to a well-formed stringified JSON encryption result */
  toAsymEncryptedDataString = Asymmetric.toAsymEncryptedDataString

  /** Ensures that the value comforms to a well-formed private Key */
  public isValidPrivateKey = (value: string): boolean => {
    return !!isValidEosPrivateKey(value)
  }

  /** Ensures that the value comforms to a well-formed Eos private Key */
  isValidEosPrivateKey = isValidEosPrivateKey

  /** Ensures that the value comforms to a well-formed public Key */
  public isValidPublicKey = (value: string): boolean => {
    return !!isValidEosPublicKey(value)
  }

  /** Ensures that the value comforms to a well-formed EOS public Key */
  isValidEosPublicKey = isValidEosPublicKey

  /** Generate a signature given some data and a private key */
  sign = eoscrypto.sign

  /** Generates new owner and active key pairs (public and private)
   *  Encrypts private keys with provided password and optional params
   *  Returns: { publicKeys:{owner, active}, privateKeys:{owner, active}, privateKeysEncrypted:{owner, active} } */
  generateNewAccountKeysWithEncryptedPrivateKeys = eoscrypto.generateNewAccountKeysAndEncryptPrivateKeys

  /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
  verifySignedWithPublicKey = eoscrypto.verifySignedWithPublicKey

  // --------- Chain helper functions

  /** Verifies that the value is a valid chain entity name (e.g. an account name) */
  public isValidEntityName = (value: string): boolean => {
    return !!isValidEosEntityName(value)
  }

  /** Verifies that the value is a valid EOS entity name (e.g. an account name) */
  isValidEosEntityName = isValidEosEntityName

  /** Verifies that the value is a valid EOS asset string */
  isValidEosAsset = isValidEosAsset

  /** Verifies that the value is a valid chain date */
  public isValidDate = (value: string): boolean => {
    return !!isValidEosDate(value)
  }

  /** Verifies that the value is a valid EOS date */
  isValidEosDate = isValidEosDate

  /** Ensures that the value comforms to a well-formed EOS asset string */
  toEosAsset = toEosAsset

  /** Ensures that the value comforms to a well-formed chain entity name (e.g. an account name) */
  public toEntityName = (value: string): ChainEntityName => {
    return toEosEntityName(value) as ChainEntityName
  }

  /** Ensures that the value comforms to a well-formed EOS entity name
   *  e.g. account, permission, or contract name */
  toEosEntityName = toEosEntityName

  /** Ensures that the value comforms to a well-formed chain date string */
  public toDate = (value: string | Date | EosDate): ChainDate => {
    return toEosDate(value) as ChainDate
  }

  /** Ensures that the value comforms to a well-formed EOS date string */
  toEosDate = toEosDate

  /** Ensures that the value comforms to a well-formed public Key */
  public toPublicKey = (value: string): PublicKey => {
    return toEosPublicKey(value) as PublicKey
  }

  /** Ensures that the value comforms to a well-formed EOS public Key */
  toEosPublicKey = toEosPublicKey

  /** Ensures that the value comforms to a well-formed private Key */
  public toPrivateKey = (value: string): PrivateKey => {
    return toEosPrivateKey(value) as PrivateKey
  }

  /** Ensures that the value comforms to a well-formed EOS private Key */
  toEosPrivateKey = toEosPrivateKey

  /** Ensures that the value comforms to a well-formed EOS signature */
  public toSignature = (value: string): Signature => {
    return this.toEosSignature(value) as Signature
  }

  /** Ensures that the value comforms to a well-formed EOS signature */
  toEosSignature = toEosSignature

  /** Returns chain type enum - resolves to chain family as a string e.g. 'eos' */
  // eslint-disable-next-line class-methods-use-this
  public get chainType(): ChainType {
    return ChainType.EosV2
  }

  /** Returns chain plug-in name */
  // eslint-disable-next-line class-methods-use-this
  public get description(): string {
    return 'EOS 2.x Chain'
  }

  /** Whether any info has been retrieved from the chain */
  public get isConnected(): boolean {
    return this._chainState?.isConnected
  }

  /** Map error from chain into a well-known ChainError type */
  public mapChainError = (error: RpcError | Error): ChainError => {
    return mapChainError(error)
  }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Install a plugin to this chain connection */
  public async installPlugin(plugin: ChainJsPlugin, options?: ChainJsPluginOptions) {
    this.assertValidPlugin(plugin)
    this._plugins = this._plugins || []
    const newPlugin = await initializePlugin(this._chainState, plugin, options)
    this._plugins.push(newPlugin)
  }

  /** rules to check tha plugin is well-formed and supported */
  private assertValidPlugin(plugin: any) {
    // TODO: We might check if type is supported in the future
    const types = this._plugins.map(plg => plg.type)
    const includes = types.includes(plugin?.type)
    if (includes) {
      throwNewError(`Type ${plugin.type} is already installed!`)
    }
  }

  /** Access to underlying eosjs sdk
   *  Warning! You use chainjs functions wherever possible and only use this sdk as an escape hatch
   */
  public get eosjs() {
    return this._chainState?.eosjs
  }
}

export { ChainEosV2 }
