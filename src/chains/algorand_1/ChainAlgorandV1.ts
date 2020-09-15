import { notImplemented } from '../../helpers'
import { ChainEndpoint, ChainType, ChainActionType, ChainEntityName } from '../../models'
import { throwNewError } from '../../errors'
import { Chain } from '../../interfaces'
import {
  AlgorandAddress,
  AlgorandChainActionType,
  AlgorandChainSettings,
  AlgorandCreateAccountOptions,
  AlgorandSymbol,
  AlgorandTransactionOptions,
  AlgorandTxAction,
  AlgorandChainInfo,
  AlgorandDecomposeReturn,
} from './models'
import { AlgorandChainState } from './algoChainState'
import * as algoCrypto from './algoCrypto'
import { AlgorandCreateAccount } from './algoCreateAccount'
import { AlgorandAccount } from './algoAccount'
import { AlgorandTransaction } from './algoTransaction'
import { composeAction } from './algoCompose'
import { decomposeAction } from './algoDecompose'
import { NATIVE_CHAIN_TOKEN_SYMBOL, NATIVE_CHAIN_TOKEN_ADDRESS } from './algoConstants'
import {
  toAlgorandSymbol,
  isValidAlgorandPrivateKey,
  isValidAlgorandPublicKey,
  toAlgorandAddress,
  toAlgorandPrivateKey,
  toAlgorandPublicKey,
  toAlgorandSignature,
} from './helpers'

class ChainAlgorandV1 implements Chain {
  private _endpoints: ChainEndpoint[]

  private _settings: AlgorandChainSettings

  private _chainState: AlgorandChainState

  constructor(endpoints: ChainEndpoint[], settings?: AlgorandChainSettings) {
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
  private newCreateAccount(options?: AlgorandCreateAccountOptions): AlgorandCreateAccount {
    this.assertIsConnected()
    return new AlgorandCreateAccount(this._chainState, options)
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private newTransaction(options?: AlgorandTransactionOptions): any {
    this.assertIsConnected()
    return new AlgorandTransaction(this._chainState, options)
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

  /** Decrypts the encrypted value with a password, and using ed25519 algorithm and SHA512 hash function */
  decrypt = algoCrypto.decrypt

  /** Encrypts a string with a password, and using ed25519 algorithm and SHA512 hash function
   * The returned, encrypted value is a stringified JSON object */
  encrypt = algoCrypto.encrypt

  /** Returns a public key given a signature and the original data was signed */
  public getPublicKeyFromSignature = (): any => {
    notImplemented()
  }

  /** Verifies that the value is a valid, stringified JSON ciphertext */
  isValidEncryptedData = algoCrypto.isEncryptedDataString

  /** Ensures that the value comforms to a well-formed private Key */
  toEncryptedDataString = algoCrypto.toEncryptedDataString

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
   *  Returns: { privateKey, publicKey } */
  generateNewAccountKeysWithEncryptedPrivateKeys = algoCrypto.generateNewAccountKeysAndEncryptPrivateKeys

  /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
  verifySignedWithPublicKey = (): any => {
    notImplemented()
  }

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
  public get nativeToken(): { symbol: AlgorandSymbol; tokenAddress: AlgorandAddress } {
    return {
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
}

export { ChainAlgorandV1 }
