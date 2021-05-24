import { initializePlugin, notImplemented } from '../../helpers'
import { ChainType, ChainActionType, ChainEntityName, CryptoCurve } from '../../models'
import { throwNewError } from '../../errors'
import { Chain } from '../../interfaces'
import {
  AlgorandAddress,
  AlgorandChainActionType,
  AlgorandChainEndpoint,
  AlgorandChainInfo,
  AlgorandChainSettings,
  AlgorandCreateAccountOptions,
  AlgorandDecomposeReturn,
  AlgorandSymbol,
  AlgorandTransactionOptions,
  AlgorandTxAction,
  AlgorandUnit,
} from './models'
import { AlgorandChainState } from './algoChainState'
import * as algoCrypto from './algoCrypto'
import { AlgorandCreateAccount } from './algoCreateAccount'
import { AlgorandAccount } from './algoAccount'
import { AlgorandTransaction } from './algoTransaction'
import { composeAction } from './algoCompose'
import { decomposeAction } from './algoDecompose'
import { NATIVE_CHAIN_TOKEN_SYMBOL, NATIVE_CHAIN_TOKEN_ADDRESS, DEFAULT_ALGO_UNIT } from './algoConstants'
import {
  toAlgorandSymbol,
  isValidAlgorandPrivateKey,
  isValidAlgorandPublicKey,
  toAlgorandAddress,
  toAlgorandPrivateKey,
  toAlgorandPublicKey,
  toAlgorandSignature,
} from './helpers'
import { Asymmetric } from '../../crypto'
import { ChainJsPlugin, ChainJsPluginOptions, PluginType } from '../../interfaces/plugin'
import { AlgorandMultisigPlugin } from './plugins/multisig/algorandMultisigPlugin'
import { NativeMultisigPlugin } from './plugins/multisig/native/plugin'

class ChainAlgorandV1 implements Chain {
  private _endpoints: AlgorandChainEndpoint[]

  private _settings: AlgorandChainSettings

  private _chainState: AlgorandChainState

  private _plugins: any[]

  constructor(endpoints: AlgorandChainEndpoint[], settings?: AlgorandChainSettings) {
    this._endpoints = endpoints
    this._settings = settings
    this._chainState = new AlgorandChainState(endpoints, settings)
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
  public get chainInfo(): AlgorandChainInfo {
    this.assertIsConnected()
    return this._chainState.chainInfo
  }

  public get endpoints(): AlgorandChainEndpoint[] {
    return this._endpoints
  }

  public get plugins(): ChainJsPlugin[] {
    return this._plugins
  }

  /** Fetch data from an on-chain contract table */
  public fetchContractData = (): any => {
    notImplemented()
  }

  /** Compose an object for a chain contract action */
  public composeAction = async (actionType: ChainActionType | AlgorandChainActionType, args: any): Promise<any> => {
    return composeAction(this._chainState, actionType, args)
  }

  /** Decompose an action and return the action type (if any) and its data */
  public decomposeAction = async (action: AlgorandTxAction): Promise<AlgorandDecomposeReturn[]> => {
    return decomposeAction(action)
  }

  /** Returns a chain Account class
   * Note: Does NOT create a new account - to create an account, use new.CreateAccount */
  private async newAccount(accountName?: AlgorandAddress): Promise<AlgorandAccount> {
    this.assertIsConnected()
    const account = new AlgorandAccount(this._chainState)
    if (accountName) {
      await account.load(accountName)
    }
    return account
  }

  /** Return a ChainAccount class used to perform any function with the chain account */
  private async newCreateAccount(options?: AlgorandCreateAccountOptions): Promise<AlgorandCreateAccount> {
    this.assertIsConnected()
    const createAccount = new AlgorandCreateAccount(this._chainState, this.multisigPlugin, options)
    await createAccount.init()
    return createAccount
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private async newTransaction(options?: AlgorandTransactionOptions): Promise<AlgorandTransaction> {
    this.assertIsConnected()
    const transaction = new AlgorandTransaction(this._chainState, this.multisigPlugin, options)
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
  cryptoCurve: CryptoCurve.Ed25519

  /** Decrypts the encrypted value with a password, and using ed25519 algorithm and SHA512 hash function */
  decryptWithPassword = algoCrypto.decryptWithPassword

  /** Encrypts a string with a password, and using ed25519 algorithm and SHA512 hash function
   * The returned, encrypted value is a stringified JSON object */
  encryptWithPassword = algoCrypto.encryptWithPassword

  /** Decrypts the encrypted value using a private key
   * The encrypted value is either a stringified JSON object or a JSON object
   * ... and must have been encrypted with the public key that matches the private ley provided */
  decryptWithPrivateKey = algoCrypto.decryptWithPrivateKey

  /** Encrypts a string using a public key
   * The encrypted result can be decrypted with the matching private key */
  encryptWithPublicKey = algoCrypto.encryptWithPublicKey

  /** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
   *  each pass uses a private keys from privateKeys array param
   *  put the keys in the same order as public keys provided to encryptWithPublicKeys() - they will be applied in the right (reverse) order
   *  The result is the decrypted string */
  decryptWithPrivateKeys = algoCrypto.decryptWithPrivateKeys

  /** Use assymmetric encryption with multiple public keys - wrapping with each
   *  Returns an array of results with the last one including the final cipertext
   *  Encrypts using publicKeys in the order they appear in the array */
  encryptWithPublicKeys = algoCrypto.encryptWithPublicKeys

  /** Generates and returns a new public/private key pair */
  generateKeyPair = algoCrypto.generateKeyPair

  /** Returns a public key given a signature and the original data was signed */
  public getPublicKeyFromSignature = (): any => {
    notImplemented()
  }

  /** Verifies that the value is a valid, stringified JSON asymmetric encryption result */
  isSymEncryptedDataString = algoCrypto.isSymEncryptedDataString

  /** Ensures that the value comforms to a well-formed stringified JSON encryption result */
  toSymEncryptedDataString = algoCrypto.toSymEncryptedDataString

  /** Verifies that the value is a valid, stringified JSON asymmetric encryption result */
  isAsymEncryptedDataString = Asymmetric.isAsymEncryptedDataString

  /** Ensures that the value comforms to a well-formed stringified JSON encryption result */
  toAsymEncryptedDataString = Asymmetric.toAsymEncryptedDataString

  /** Ensures that the value comforms to a well-formed private Key */
  public isValidPrivateKey = (value: string): boolean => {
    return !!isValidAlgorandPrivateKey(value)
  }

  /** Ensures that the value comforms to a well-formed public Key */
  public isValidPublicKey = (value: string): boolean => {
    return !!isValidAlgorandPublicKey(value)
  }

  /** Generate a signature given some data and a private key */
  sign = algoCrypto.sign

  /** Generates new key pairs (public and private)
   *  Encrypts private key with provided password
   *  Returns: { privateKey, publicKey, encryptedPrivateKey } */
  generateNewAccountKeysWithEncryptedPrivateKeys = algoCrypto.generateNewAccountKeysAndEncryptPrivateKeys

  /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
  verifySignedWithPublicKey = algoCrypto.verifySignedWithPublicKey

  // --------- Chain helper functions

  /** Verifies that the value is a valid chain entity name (e.g. an account name) */
  public isValidEntityName = (): any => {
    notImplemented()
  }

  /** Verifies that the value is a valid chain date */
  public isValidDate = (): any => {
    notImplemented()
  }

  /** Ensures that the value comforms to a well-formed chain entity name (e.g. an account name) */
  public toEntityName = (value: string): ChainEntityName => {
    return toAlgorandAddress(value) as ChainEntityName
  }

  /** Ensures that the value comforms to a well-formed chain date string */
  public toDate = (): any => {
    notImplemented()
  }

  /** Ensures that the value comforms to a well-formed public Key */
  public toPublicKey = toAlgorandPublicKey

  /** Ensures that the value comforms to a well-formed private Key */
  public toPrivateKey = toAlgorandPrivateKey

  /** Ensures that the value comforms to a well-formed EOS signature */
  public toSignature = toAlgorandSignature

  /** Returns chain type enum - resolves to chain family as a string e.g. 'eos' */
  // eslint-disable-next-line class-methods-use-this
  public get chainType(): ChainType {
    return ChainType.AlgorandV1
  }

  /** Returns chain plug-in name */
  // eslint-disable-next-line class-methods-use-this
  public get description(): string {
    return 'Algorand v1 chain'
  }

  /** Returns chain native token symbol and default token contract address */
  public get nativeToken(): { defaultUnit: AlgorandUnit; symbol: AlgorandSymbol; tokenAddress: AlgorandAddress } {
    return {
      defaultUnit: DEFAULT_ALGO_UNIT,
      symbol: toAlgorandSymbol(NATIVE_CHAIN_TOKEN_SYMBOL),
      tokenAddress: NATIVE_CHAIN_TOKEN_ADDRESS,
    }
  }

  /** Get the balance for an account from the chain
   *  If symbol = 'algo', returns Algo balance (in units of Algo)
   *  Else returns the asset balance of the account for the provided symbol (asset symbol),  if the symbol is valid
   *  Returns a string representation of the value to accomodate large numbers */
  public async fetchBalance(
    account: AlgorandAddress,
    symbol: AlgorandSymbol,
    tokenAddress?: AlgorandAddress,
  ): Promise<{ balance: string }> {
    return this._chainState.fetchBalance(account, symbol, tokenAddress)
  }

  /** Whether any info has been retrieved from the chain */
  public get isConnected(): boolean {
    return this._chainState?.isConnected
  }

  /** Map error from chain into a well-known ChainError type */
  public mapChainError = (): any => {
    notImplemented()
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

  public get multisigPlugin(): AlgorandMultisigPlugin {
    const multisigPlugin = this._plugins?.find(plugin => plugin?.type === PluginType.MultiSig)
    return multisigPlugin || new NativeMultisigPlugin()
  }

  /** rules to check tha plugin is well-formed and supported */
  private assertValidPlugin(plugin: any) {
    // TODO: We might check if type is supported in the future
    const types = this._plugins?.map(plg => plg.type)
    const includes = types?.includes(plugin?.type)
    if (includes) {
      throwNewError(`Type ${plugin.type} is already installed!`)
    }
  }

  /** Access to underlying algoSdk
   *  Warning! You use chainjs functions wherever possible and only use this sdk as an escape hatch
   */
  public get algoClient() {
    return this._chainState?.algoClient
  }

  /** Access to underlying algoSdk indexer */
  public get algoClientIndexer() {
    return this._chainState?.algoClientIndexer
  }
}

export { ChainAlgorandV1 }
