import { RpcError } from 'eosjs'
import { Chain, ChainEndpoint, ChainInfo, ChainSettings, CreateAccount, TransactionOptions } from '../../models'
import { ChainError, throwNewError } from '../../errors'
import * as crypto from '../../crypto'
import * as eoscrypto from './eosCrypto'
import { EosChainState } from './eosChainState'
import { mapChainError } from './eosErrors'
import { composeAction, ChainActionType } from './eosCompose'
import { EosTransaction } from './eosTransaction'
import { EosCreateAccount } from './eosCreateAccount'
import { EosEntityName, isValidEosPublicKey, isValidEosPrivateKey } from './models'
import { EosAccount } from './eosAccount'

class EosChainV18 implements Chain {
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
   * Note: Does NOT create a new account - to create an account, use newCreateAccount */
  public async newAccount(accountName: EosEntityName): Promise<EosAccount> {
    this.assertIsConnected()
    const account = new EosAccount(this._chainState)
    await account.fetchFromChain(accountName)
    return account
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  public newCreateAccount(): CreateAccount {
    this.assertIsConnected()
    return new EosCreateAccount(this._chainState)
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  public newTransaction(options?: TransactionOptions): EosTransaction {
    this.assertIsConnected()
    return new EosTransaction(this._chainState, options)
  }

  /** Chain crytography functions */
  public crypto = {
    decrypt: crypto.decrypt,
    encrypt: crypto.encrypt,
    getPublicKeyFromSignature: eoscrypto.getPublicKeyFromSignature,
    isValidEncryptedData: crypto.isEncryptedDataString,
    isValidPrivateKey: isValidEosPrivateKey,
    isValidPublicKey: isValidEosPublicKey,
    sign: eoscrypto.sign,
    generateNewAccountKeysWithEncryptedPrivateKeys: eoscrypto.generateNewAccountKeysAndEncryptPrivateKeys,
    verifySignedWithPublicKey: eoscrypto.verifySignedWithPublicKey,
  }

  /** Returns chain plug-in name */
  public description = (): string => {
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

export { EosChainV18 }
