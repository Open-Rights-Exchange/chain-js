/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from '../../interfaces'
import { ChainActionType, ChainDate, ChainEntityName, ChainInfo, ChainType, CryptoCurve } from '../../models'
import { ChainError, throwNewError } from '../../errors'
import * as ethcrypto from './ethCrypto'
import { composeAction } from './ethCompose'
import { decomposeAction } from './ethDecompose'
import { EthereumTransaction } from './ethTransaction'
import { EthereumChainState } from './ethChainState'
import { EthereumCreateAccount } from './ethCreateAccount'
import { EthereumAccount } from './ethAccount'
import { mapChainError } from './ethErrors'
import {
  EthereumAddress,
  EthereumChainActionType,
  EthereumChainEndpoint,
  EthereumChainSettings,
  EthereumCreateAccountOptions,
  EthereumDate,
  EthereumDecomposeReturn,
  EthereumPublicKey,
  EthereumSymbol,
  EthereumTransactionAction,
  EthUnit,
} from './models'
import {
  isValidEthereumDateString,
  isValidEthereumEntityName,
  isValidEthereumPublicKey,
  isValidEthereumPrivateKey,
  toEthereumDate,
  toEthereumEntityName,
  toEthereumPublicKey,
  toEthereumPrivateKey,
  toEthereumSignature,
  toEthereumSymbol,
} from './helpers'
import { NATIVE_CHAIN_TOKEN_SYMBOL, NATIVE_CHAIN_TOKEN_ADDRESS, DEFAULT_ETH_UNIT } from './ethConstants'
import { Asymmetric } from '../../crypto'
import { ChainJsPlugin, ChainJsPluginOptions, PluginType } from '../../interfaces/plugin'
import { initializePlugin } from '../../helpers'
import { EthereumMultisigPlugin } from './plugins/multisig/ethereumMultisigPlugin'

// TODO: Comsolidate use of Ethereum libraries

/** Provides support for the Ethereum blockchain
 *  Provides Ethereum-specific implementations of the Chain interface
 *  Also includes some features only available on this platform */
class ChainEthereumV1 implements Chain {
  private _endpoints: EthereumChainEndpoint[]

  private _settings: EthereumChainSettings

  private _chainState: EthereumChainState

  private _plugins: any[]

  constructor(endpoints: EthereumChainEndpoint[], settings?: EthereumChainSettings) {
    this._endpoints = endpoints
    this._settings = settings
    this._chainState = new EthereumChainState(endpoints, settings)
  }

  public get isConnected(): boolean {
    return this._chainState?.isConnected
  }

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */

  /** Returns chain type enum - resolves to chain family as a string e.g. 'ethereum' */
  // eslint-disable-next-line class-methods-use-this
  public get chainType(): ChainType {
    return ChainType.EthereumV1
  }

  public connect(): Promise<void> {
    return this._chainState.connect()
  }

  public get chainId(): string {
    return this._chainState.chainId
  }

  public get chainInfo(): ChainInfo {
    return this._chainState.chainInfo
  }

  public get endpoints(): EthereumChainEndpoint[] {
    return this._endpoints
  }

  public get plugins(): ChainJsPlugin[] {
    return this._plugins
  }

  public composeAction = async (
    actionType: ChainActionType | EthereumChainActionType,
    args: any,
  ): Promise<EthereumTransactionAction> => {
    return composeAction(actionType, args)
  }

  public decomposeAction = async (action: EthereumTransactionAction): Promise<EthereumDecomposeReturn[]> => {
    return decomposeAction(action)
  }

  // eslint-disable-next-line class-methods-use-this
  public get description(): string {
    return 'Ethereum 1.0 Chain'
  }

  /** Returns chain native token symbol and default token contract address */
  public get nativeToken(): { defaultUnit: EthUnit; symbol: EthereumSymbol; tokenAddress: EthereumAddress } {
    return {
      defaultUnit: DEFAULT_ETH_UNIT,
      symbol: toEthereumSymbol(NATIVE_CHAIN_TOKEN_SYMBOL),
      tokenAddress: NATIVE_CHAIN_TOKEN_ADDRESS,
    }
  }

  /** Get the balance for an account from the chain
   *  If tokenAddress is provided, returns balance for ERC20 token
   *  If symbol = 'eth', returns Eth balance (in units of Ether)
   *  Returns a string representation of the value to accomodate large numbers */
  public async fetchBalance(
    account: EthereumAddress,
    symbol: EthereumSymbol,
    tokenAddress?: EthereumAddress,
  ): Promise<{ balance: string }> {
    return this._chainState.fetchBalance(account, symbol, tokenAddress)
  }

  /** Fetch data from an on-chain contract table */
  public fetchContractData = (
    contract: string,
    table: string,
    owner: string,
    indexNumber: number,
    lowerRow: number,
    upperRow: number,
    limit: number,
    reverseOrder: boolean,
    showPayer: boolean,
    keyType: string,
  ): Promise<any> => {
    return null
  }

  /** Returns a chain Account class
   * Note: Does NOT create a new ethereum address - to create an address, use new.CreateAccount */
  private newAccount = async (address?: EthereumAddress): Promise<EthereumAccount> => {
    this.assertIsConnected()
    const account = new EthereumAccount(this._chainState)
    if (address) {
      await account.load(address)
    }
    return account
  }

  private newCreateAccount = async (options?: EthereumCreateAccountOptions<any>): Promise<EthereumCreateAccount> => {
    this.assertIsConnected()
    const createAccount = new EthereumCreateAccount(this._chainState, this.multisigPlugin, options)
    await createAccount.init()
    return createAccount
  }

  private newTransaction = async (options?: any): Promise<EthereumTransaction> => {
    this.assertIsConnected()
    const transaction = new EthereumTransaction(this._chainState, this.multisigPlugin, options)
    await transaction.init()
    return transaction
  }

  public new = {
    Account: this.newAccount,
    CreateAccount: this.newCreateAccount,
    Transaction: this.newTransaction,
  }

  // --------- Chain crytography functions */
  /** Primary cryptography curve used by this chain */
  cryptoCurve: CryptoCurve.Secp256k1

  /** Decrypts the encrypted value using a password, and optional parameters using AES algorithm and SHA256 hash function
   * Expects the encrypted value to be a stringified JSON object */
  decryptWithPassword = ethcrypto.decryptWithPassword

  /** Encrypts a string using a password and optional parameters using AES algorithm and SHA256 hash function
   * The returned, encrypted value is a stringified JSON object */
  encryptWithPassword = ethcrypto.encryptWithPassword

  /** Decrypts the encrypted value using a private key
   * The encrypted value is either a stringified JSON object or a JSON object
   * ... and must have been encrypted with the public key that matches the private ley provided */
  decryptWithPrivateKey = ethcrypto.decryptWithPrivateKey

  /** Encrypts a string using a public key
   * The encrypted result can be decrypted with the matching private key */
  encryptWithPublicKey = ethcrypto.encryptWithPublicKey

  /** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
   *  each pass uses a private keys from privateKeys array param
   *  put the keys in the same order as public keys provided to encryptWithPublicKeys() - they will be applied in the right (reverse) order
   *  The result is the decrypted string */
  decryptWithPrivateKeys = ethcrypto.decryptWithPrivateKeys

  /** Use assymmetric encryption with multiple public keys - wrapping with each
   *  Returns an array of results with the last one including the final cipertext
   *  Encrypts using publicKeys in the order they appear in the array */
  encryptWithPublicKeys = ethcrypto.encryptWithPublicKeys

  /** Returns a public key given a signature and the original data was signed */
  getPublicKeyFromSignature = ethcrypto.getEthereumPublicKeyFromSignature

  /** Verifies that the value is a valid, stringified JSON asymmetric encryption result */
  isSymEncryptedDataString = ethcrypto.isSymEncryptedDataString

  /** Ensures that the value comforms to a well-formed stringified JSON encryption result */
  toSymEncryptedDataString = ethcrypto.toSymEncryptedDataString

  /** Verifies that the value is a valid, stringified JSON asymmetric encryption result */
  isAsymEncryptedDataString = Asymmetric.isAsymEncryptedDataString

  /** Ensures that the value comforms to a well-formed stringified JSON encryption result */
  toAsymEncryptedDataString = Asymmetric.toAsymEncryptedDataString

  /** Ensures that the value comforms to a well-formed Eos private Key */
  isValidPrivateKey = isValidEthereumPrivateKey

  /** Ensures that the value comforms to a well-formed public Key */
  isValidPublicKey = isValidEthereumPublicKey

  /** Generates and returns a new public/private key pair */
  generateKeyPair = ethcrypto.generateKeyPair

  /** Generates new key pairs (public and private)
   *  Encrypts private key with provided password (and optional salt)
   *  Returns: { privateKey, publicKey, encryptedPrivateKey } */
  generateNewAccountKeysWithEncryptedPrivateKeys = ethcrypto.generateNewAccountKeysAndEncryptPrivateKeys

  /** Generate a signature given some data and a private key */
  sign = ethcrypto.sign

  /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
  verifySignedWithPublicKey = ethcrypto.verifySignedWithPublicKey

  // Chain Helper Functions

  // --------- Chain helper functions

  /** Verifies that the value is a valid chain entity name (e.g. an account name) */
  public isValidEntityName = (value: string): boolean => {
    return isValidEthereumEntityName(value)
  }

  /** Verifies that the value is a valid Ethereum entity name (e.g. an account name) */
  isValidEthereumEntityName = isValidEthereumEntityName

  /** Verifies that the value is a valid chain date */
  public isValidDate = (value: string): boolean => {
    return isValidEthereumDateString(value)
  }

  /** Verifies that the value is a valid Ethereum date */
  isValidEthereumDate = isValidEthereumDateString

  /** Ensures that the value comforms to a well-formed chain entity name (e.g. an account name) */
  public toEntityName = (value: string): ChainEntityName => {
    return toEthereumEntityName(value) as ChainEntityName
  }

  /** Ensures that the value comforms to a well-formed Ethereum entity name
   *  e.g. account, permission, or contract name */
  toEthereumEntityName = toEthereumEntityName

  /** Ensures that the value comforms to a well-formed chain date string */
  public toDate = (value: string | Date | EthereumDate): ChainDate => {
    return toEthereumDate(value) as ChainDate
  }

  /** Ensures that the value comforms to a well-formed EOS public Key */
  toPublicKey = toEthereumPublicKey

  /** Ensures that the value comforms to a well-formed private Key */
  toPrivateKey = toEthereumPrivateKey

  /** Ensures that the value comforms to a well-formed signature */
  toSignature = toEthereumSignature

  /** Returns a new EthereumAccount class using the provided ethereum public key */
  public setPublicKey = (publicKey: EthereumPublicKey) => {
    return new EthereumAccount(this._chainState).setPublicKey(publicKey)
  }

  /** Map error from chain into a well-known ChainError type */
  public mapChainError = (error: Error): ChainError => {
    return mapChainError(error, null)
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

  public get multisigPlugin(): EthereumMultisigPlugin {
    return this._plugins?.find(plugin => plugin?.type === PluginType.MultiSig)
  }

  // TODO: Move to helpers
  /** rules to check tha plugin is well-formed and supported */
  private assertValidPlugin(plugin: any) {
    // TODO: We might check if type is supported in the future
    const types = this._plugins?.map(plg => plg.type)
    const includes = types?.includes(plugin?.type)
    if (includes) {
      throwNewError(`Type ${plugin.type} is already installed!`)
    }
  }

  /** Access to underlying web3 sdk
   *  Warning! You use chainjs functions wherever possible and only use this sdk as an escape hatch
   */
  public get web3() {
    return this._chainState?.web3
  }
}

export { ChainEthereumV1 }
