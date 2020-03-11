/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from '../../interfaces'
import { ChainActionType, ChainEndpoint, ChainInfo, ChainSettings, ChainType } from '../../models'
// import { ChainState } from './chainState';
import { ChainError, throwNewError } from '../../errors'
import * as crypto from '../../crypto'
import * as ethcrypto from './ethCrypto'
import { composeAction, EthereumChainActionType } from './ethCompose'
import { EthereumTransaction } from './ethTransaction'
import { EthereumChainState } from './ethChainState'
import { EthereumCreateAccount } from './ethCreateAccount'
import { EthereumAccount } from './ethAccount'
import { notImplemented } from '../../helpers'
import { EthereumCreateAccountOptions, EthereumPublicKey, EthereumAddress } from './models'
import {
  isValidEthereumPublicKey,
  isValidEthereumPrivateKey,
  toEthereumPublicKey,
  toEthereumPrivateKey,
  toEthereumSignature,
} from './helpers'
/** Provides support for the Ethereum blockchain
 *  Provides Ethereum-specific implementations of the Chain interface
 *  Also includes some features only available on this platform */
class ChainEthereumV1 implements Chain {
  private _endpoints: ChainEndpoint[]

  private _settings: ChainSettings

  private _chainState: EthereumChainState

  constructor(endpoints: ChainEndpoint[], settings?: ChainSettings) {
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

  public composeAction = (actionType: ChainActionType | EthereumChainActionType, args: any): any => {
    return composeAction(actionType, args)
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

  // Chain Crypto Functions

  decrypt = crypto.decrypt

  encrypt = crypto.encrypt

  getPublicKeyFromSignature = ethcrypto.getEthereumPublicKeyFromSignature

  isValidEncryptedData = crypto.isEncryptedDataString

  toEncryptedDataString = crypto.toEncryptedDataString

  isValidPrivateKey = isValidEthereumPrivateKey

  isValidPublicKey = isValidEthereumPublicKey

  generateNewAccountKeysWithEncryptedPrivateKeys = ethcrypto.generateNewAccountKeysAndEncryptPrivateKeys

  sign = ethcrypto.sign

  verifySignedWithPublicKey = ethcrypto.verifySignedWithPublicKey

  // Chain Helper Functions

  isValidEntityName = notImplemented

  isValidAsset = notImplemented

  isValidDate = notImplemented

  toEntityName = notImplemented

  toAsset = notImplemented

  toDate = notImplemented

  toPublicKey = toEthereumPublicKey

  toPrivateKey = toEthereumPrivateKey

  toSignature = toEthereumSignature

  public setPublicKey = (publicKey: EthereumPublicKey) => {
    return new EthereumAccount(this._chainState).setPublicKey(publicKey)
  }

  public mapChainError = (error: Error): ChainError => {
    notImplemented()
    return new ChainError(null, null, null)
  }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }
}

export { ChainEthereumV1 }
