/* eslint-disable @typescript-eslint/no-unused-vars */
import { BN } from 'ethereumjs-util'
import { Chain } from '../../interfaces'
import { ChainActionType, ChainInfo, ChainType, ChainAsset, ChainEntityName, ChainDate } from '../../models'
// import { ChainState } from './chainState';
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
  EthereumChainEndpoint,
  EthereumChainSettings,
  EthereumCreateAccountOptions,
  EthereumPublicKey,
  EthereumAddress,
  EthereumDate,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from './models'
import {
  isValidEthereumAsset,
  isValidEthereumDateString,
  isValidEthereumEntityName,
  isValidEthereumPublicKey,
  isValidEthereumPrivateKey,
  toEthereumAsset,
  toEthereumDate,
  toEthereumEntityName,
  toEthereumPublicKey,
  toEthereumPrivateKey,
  toEthereumSignature,
} from './helpers'
import { notImplemented } from '../../helpers'

/** Provides support for the Ethereum blockchain
 *  Provides Ethereum-specific implementations of the Chain interface
 *  Also includes some features only available on this platform */
class ChainEthereumV1 implements Chain {
  private _endpoints: EthereumChainEndpoint[]

  private _settings: EthereumChainSettings

  private _chainState: EthereumChainState

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

  public composeAction = (
    actionType: ChainActionType | EthereumChainActionType,
    args: any,
  ): EthereumTransactionAction => {
    return composeAction(actionType, args)
  }

  public decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn[] => {
    return decomposeAction(action)
  }

  // eslint-disable-next-line class-methods-use-this
  public get description(): string {
    return 'Etereum 1.0 Chain'
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

  private newCreateAccount = (options?: EthereumCreateAccountOptions): any => {
    this.assertIsConnected()
    return new EthereumCreateAccount(this._chainState, options)
  }

  private newTransaction = (options?: any): EthereumTransaction => {
    this.assertIsConnected()
    return new EthereumTransaction(this._chainState, options)
  }

  public new = {
    Account: this.newAccount,
    CreateAccount: this.newCreateAccount,
    Transaction: this.newTransaction,
  }

  // --------- Chain crytography functions */

  /** Decrypts the encrypted value using a password, and optional parameters using AES algorithm and SHA256 hash function
   * Expects the encrypted value to be a stringified JSON object */
  decrypt = ethcrypto.decrypt

  /** Encrypts a string using a password and optional parameters using AES algorithm and SHA256 hash function
   * The returned, encrypted value is a stringified JSON object */
  encrypt = ethcrypto.encrypt

  /** Returns a public key given a signature and the original data was signed */
  getPublicKeyFromSignature = ethcrypto.getEthereumPublicKeyFromSignature

  /** Verifies that the value is a valid, stringified JSON ciphertext */
  isValidEncryptedData = ethcrypto.isEncryptedDataString

  /** Ensures that the value comforms to a well-formed private Key */
  toEncryptedDataString = ethcrypto.toEncryptedDataString

  /** Ensures that the value comforms to a well-formed Eos private Key */
  isValidPrivateKey = isValidEthereumPrivateKey

  /** Ensures that the value comforms to a well-formed public Key */
  isValidPublicKey = isValidEthereumPublicKey

  /** Generates new key pairs (public and private)
   *  Encrypts private key with provided password (and optional salt)
   *  Returns: { privateKey, publicKey } */
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

  /** Verifies that the value is a valid chain asset string */
  public isValidAsset = (value: number | BN): boolean => {
    return isValidEthereumAsset(value)
  }

  /** Verifies that the value is a valid Ethereum value */
  isValidEthereumAsset = isValidEthereumAsset

  /** Verifies that the value is a valid chain date */
  public isValidDate = (value: string): boolean => {
    return isValidEthereumDateString(value)
  }

  /** Verifies that the value is a valid Ethereum date */
  isValidEthereumDate = isValidEthereumDateString

  /** Ensures that the value comforms to a well-formed ethereum value */
  public toAsset = (amount: number, symbol: string): ChainAsset => {
    return toEthereumAsset(amount, symbol) as ChainAsset
  }

  /** Ensures that the value comforms to a well-formed Ethereum value */
  toEthereumAsset = toEthereumAsset

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
}

export { ChainEthereumV1 }
