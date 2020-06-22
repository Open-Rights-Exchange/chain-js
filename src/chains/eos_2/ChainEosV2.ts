import { RpcError } from 'eosjs'
import {
  ChainActionType,
  ChainInfo,
  TransactionOptions,
  ChainType,
  ChainEntityName,
  ChainAsset,
  ChainDate,
  PublicKey,
  PrivateKey,
  Signature,
  TokenQuery,
  TokenData,
} from '../../models'
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
} from './helpers'
import {
  EosActionStruct,
  EosChainSettings,
  EosEntityName,
  EosDate,
  EosCreateAccountOptions,
  EosDecomposeReturn,
  EosChainEndpoint,
} from './models'
import { getDefaultTokenBalance } from '../../helpers'

/** Provides support for the EOS blockchain
 *  Provides EOS-specific implementations of the Chain interface
 *  Also includes some features only available on this platform */
class ChainEosV2 implements Chain {
  private _endpoints: EosChainEndpoint[]

  private _settings: EosChainSettings

  private _chainState: EosChainState

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

  /** Returns chain specific native token symbol */
  public get nativeTokenData(): TokenData {
    return {
      symbol: 'EOS',
      contract: 'eosio.token',
    }
  }

  /**
   * Composes the necessary structure to query token balances using fetchTokenBalance
   */
  public composeBalanceCheck(contract: string, chainAccount: string, symbol: string): TokenQuery {
    return {
      contract,
      chainAccount,
      symbol,
    }
  }

  /** Compose object structure necessary for checking token balances */
  public async fetchTokenBalance(tokenQuery: TokenQuery): Promise<{ balance: string }> {
    const { contract, chainAccount, symbol } = tokenQuery
    const response = (await this._chainState.rpc.get_currency_balance(contract, chainAccount, symbol)) || []
    const [balance] = response
    return { balance: balance || getDefaultTokenBalance(symbol) }
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
  public composeAction = (actionType: ChainActionType, args: any): EosActionStruct => {
    return composeAction(actionType, args)
  }

  /** Decompose a contract action and return the action type (if any) and its data */
  public decomposeAction = (action: EosActionStruct): EosDecomposeReturn[] => {
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
  private newCreateAccount(options?: EosCreateAccountOptions): EosCreateAccount {
    this.assertIsConnected()
    return new EosCreateAccount(this._chainState, options)
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private newTransaction(options?: TransactionOptions): EosTransaction {
    this.assertIsConnected()
    return new EosTransaction(this._chainState, options)
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

  /** Decrypts the encrypted value using a password, and optional parameters using AES algorithm and SHA256 hash function
   * Expects the encrypted value to be a stringified JSON object */
  decrypt = eoscrypto.decrypt

  /** Encrypts a string using a password and optional parameters using AES algorithm and SHA256 hash function
   * The returned, encrypted value is a stringified JSON object */
  encrypt = eoscrypto.encrypt

  /** Returns a public key given a signature and the original data was signed */
  public getPublicKeyFromSignature = (
    signature: string | Buffer,
    data: string | Buffer,
    encoding: string,
  ): PublicKey => {
    return eoscrypto.getPublicKeyFromSignature(signature, data, encoding) as PublicKey
  }

  /** Verifies that the value is a valid, stringified JSON ciphertext */
  isValidEncryptedData = eoscrypto.isEncryptedDataString

  /** Ensures that the value comforms to a well-formed private Key */
  toEncryptedDataString = eoscrypto.toEncryptedDataString

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
   *  Returns: { publicKeys:{owner, active}, privateKeys:{owner, active} } */
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

  /** Verifies that the value is a valid chain asset string */
  public isValidAsset = (value: string): boolean => {
    return !!isValidEosAsset(value)
  }

  /** Verifies that the value is a valid EOS asset string */
  isValidEosAsset = isValidEosAsset

  /** Verifies that the value is a valid chain date */
  public isValidDate = (value: string): boolean => {
    return !!isValidEosDate(value)
  }

  /** Verifies that the value is a valid EOS date */
  isValidEosDate = isValidEosDate

  /** Ensures that the value comforms to a well-formed chain asset string */
  public toAsset = (amount: number, symbol: string): ChainAsset => {
    return toEosAsset(amount, symbol) as ChainAsset
  }

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
}

export { ChainEosV2 }
