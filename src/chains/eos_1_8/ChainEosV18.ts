import { RpcError } from 'eosjs'
import { ChainEndpoint, ChainInfo, ChainSettings, TransactionOptions, ChainType } from '../../models'
import { Chain } from '../../interfaces'
import { ChainError, throwNewError } from '../../errors'
import * as crypto from '../../crypto'
import * as eoscrypto from './eosCrypto'
import { EosChainState } from './eosChainState'
import { mapChainError } from './eosErrors'
import { composeAction, ChainActionType } from './eosCompose'
import { EosTransaction } from './eosTransaction'
import { EosCreateAccount } from './eosCreateAccount'
import { EosAccount } from './eosAccount'
import {
  isValidEosPrivateKey,
  isValidEosPublicKey,
  toEosPublicKey,
  toEosPrivateKey,
  isValidEosEntityName,
  isValidEosAsset,
  isValidEosDate,
  toEosEntityName,
  toEosAsset,
  toEosDate,
} from './helpers'
import { EosEntityName } from './models'

/** Provides support for the EOS blockchain
 *  Provides EOS-specific implementations of the Chain interface
 *  Also includes some features only available on this platform */
class ChainEosV18 implements Chain {
  private _endpoints: ChainEndpoint[]

  private _settings: ChainSettings

  private _chainState: EosChainState

  constructor(endpoints: ChainEndpoint[], settings?: ChainSettings) {
    this._endpoints = endpoints
    this._settings = settings
    this._chainState = new EosChainState(endpoints, settings)
  }

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */

  public connect(): Promise<void> {
    return this._chainState.connect()
  }

  /** Enum of contract actions supported by chain */
  public ChainActionType = ChainActionType

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
  public composeAction = (actionType: ChainActionType, args: any): any => {
    return composeAction(actionType, args)
  }

  /** Returns a chain Account class
   * Note: Does NOT create a new account - to create an account, use new.createAccount */
  private async newAccount(accountName?: EosEntityName): Promise<EosAccount> {
    this.assertIsConnected()
    const account = new EosAccount(this._chainState)
    if (accountName) {
      await account.fetchFromChain(accountName)
    }
    return account
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private newCreateAccount(): EosCreateAccount {
    this.assertIsConnected()
    return new EosCreateAccount(this._chainState)
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private newTransaction(options?: TransactionOptions): EosTransaction {
    this.assertIsConnected()
    return new EosTransaction(this._chainState, options)
  }

  public new = {
    /** Returns a new chain Account object
     * If an account name is provided, it will be fetched from the chain and loaded into the returned account object
     * Note: Does NOT create a new account - to create an account, use new.createAccount */
    account: this.newAccount.bind(this),
    /** Return a new CreateAccount object used to help with creating a new chain account */
    createAccount: this.newCreateAccount.bind(this),
    /** Return a chain Transaction object used to compose and send transactions */
    transaction: this.newTransaction.bind(this),
  }

  /** Chain crytography functions */
  public crypto = {
    decrypt: crypto.decrypt.bind(this),
    encrypt: crypto.encrypt.bind(this),
    getPublicKeyFromSignature: eoscrypto.getPublicKeyFromSignature.bind(this),
    isValidEncryptedData: crypto.isEncryptedDataString.bind(this),
    isValidPrivateKey: isValidEosPrivateKey.bind(this),
    isValidPublicKey: isValidEosPublicKey.bind(this),
    sign: eoscrypto.sign.bind(this),
    generateNewAccountKeysWithEncryptedPrivateKeys: eoscrypto.generateNewAccountKeysAndEncryptPrivateKeys.bind(this),
    verifySignedWithPublicKey: eoscrypto.verifySignedWithPublicKey.bind(this),
  }

  /** Chain helper functions */
  public helpers = {
    isValidEntityName: isValidEosEntityName.bind(this),
    isValidAsset: isValidEosAsset.bind(this),
    isValidDate: isValidEosDate.bind(this),
    toEntityName: toEosEntityName.bind(this),
    toAsset: toEosAsset.bind(this),
    toDate: toEosDate.bind(this),
    toPublicKey: toEosPublicKey.bind(this),
    toPrivateKey: toEosPrivateKey.bind(this),
  }

  /** Returns chain type enum - resolves to chain family as a string e.g. 'eos' */
  // eslint-disable-next-line class-methods-use-this
  public get chainType(): ChainType {
    return ChainType.EosV18
  }

  /** Returns chain plug-in name */
  // eslint-disable-next-line class-methods-use-this
  public get description(): string {
    return 'EOS 1.8 Chain'
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

export { ChainEosV18 }
