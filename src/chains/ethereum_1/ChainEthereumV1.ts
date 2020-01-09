/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain, ChainEndpoint, ChainInfo, ChainSettings } from '../../models'
// import { ChainState } from './chainState';
import { ChainError, throwNewError } from '../../errors'
import * as crypto from '../../crypto'
import * as ethcrypto from './ethCrypto'
import { composeAction, ChainActionType } from './ethCompose'
import { EthereumTransaction } from './ethTransaction'
import { EthereumChainState } from './ethChainState'

class ChainEthereumV1 implements Chain {
  private _endpoints: ChainEndpoint[]

  private _settings: ChainSettings

  private _chainState: EthereumChainState

  constructor(endpoints: ChainEndpoint[], settings?: ChainSettings) {
    this._endpoints = endpoints
    this._settings = settings
    this._chainState = new EthereumChainState(endpoints, settings)
  }

  public ChainActionType = ChainActionType

  public isConnected = this._chainState.isConnected

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */

  public connect(): Promise<void> {
    return this._chainState.connect()
  }

  public get chainId(): string {
    return this._chainState.chainId
  }

  public get chainInfo(): ChainInfo {
    return this._chainState.chainInfo
  }

  public composeAction = (actionType: ChainActionType, args: any): any => {
    return composeAction(actionType, args)
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

  public crypto = {
    decrypt: crypto.decrypt,
    encrypt: crypto.encrypt,
    getPublicKeyFromSignature: ethcrypto.getPublicKeyFromSignature,
    isValidEncryptedData: crypto.isEncryptedDataString,
    isValidPrivateKey: ethcrypto.isValidPrivateKey,
    isValidPublicKey: ethcrypto.isValidPublicKey,
    generateNewAccountKeysWithEncryptedPrivateKeys: ethcrypto.generateNewAccountKeysAndEncryptPrivateKeys,
    sign: ethcrypto.sign,
    verifySignedWithPublicKey: ethcrypto.verifySignedWithPublicKey,
  }

  private newAccount = (options?: any): any => {
    return null
  }

  private newCreateAccount = (options?: any): any => {
    return null
  }

  private newTransaction = (options?: any): EthereumTransaction => {
    return null
  }

  public new = {
    account: this.newAccount,
    createAccount: this.newCreateAccount,
    transaction: this.newTransaction,
  }

  public description(): string {
    if (!this.isConnected) throwNewError('Chain not connected. Call connect() to initialize chain first')
    return 'Etereum 1.0 Chain'
  }

  public mapChainError = (error: Error): ChainError => {
    throwNewError('Not Implemented')
    return new ChainError(null, null, null)
  }
}

export { ChainEthereumV1 }
