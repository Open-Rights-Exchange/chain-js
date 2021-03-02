import { 
  ChainActionType, 
  ChainInfo, 
  ChainType, 
  CryptoCurve, 
  ChainEntityName,
  ChainDate,
} from '../../models'
import {
  ChainError, 
} from '../../errors'
import { Chain } from '../../interfaces'
import { 
  PolkadotChainEndpoint, 
  PolkadotChainSettings, 
  PolkadotNewKeysOptions, 
  PolkadotSymbol, 
  PolkadotAddress, 
} from './models'
import { PolkadotChainState } from './polkadotChainState'
import { notImplemented } from '../../helpers'
import { PolkadotChainActionType } from './models/chainActionType'
import { 
  
  PolkadotTransactionAction,    
} from './models/transactionModels'
import { PolkadotDecomposeReturn } from './models/PolkadotStructures'
import { PolkadotAccount } from './polkadotAccount'
import { PolkadotTransaction } from './polkadotTransaction'

import * as ethcrypto from '../ethereum_1/ethCrypto'
import { Asymmetric } from '../../crypto'
import {
  isValidEthereumPrivateKey,
  isValidEthereumPublicKey,
  isValidEthereumDateString,
  toEthereumEntityName,
  toEthereumDate,
  toEthereumPublicKey,
  toEthereumPrivateKey,
  toEthereumSignature,
} from '../ethereum_1/helpers'
import { PolkadotPublicKey } from './models'
import { SignedBlock } from '@polkadot/types/interfaces/runtime'
import { PolkadotCreateAccount } from './polkadotCreateAccount'
import { PolkadotCreateAccountOptions } from './models/accountModels'

class ChainPolkadotV1 implements Chain {
  private _endpoints: PolkadotChainEndpoint[]

  private _settings: PolkadotChainSettings

  private _chainState: PolkadotChainState

  constructor(endpoints: PolkadotChainEndpoint[], settings?: PolkadotChainSettings) {
    this._endpoints = endpoints
    this._settings = settings
    this._chainState = new PolkadotChainState(endpoints, settings)
  }

  public get isConnected(): boolean {
    return this._chainState?.isConnected
  }

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */
  public connect(): Promise<void> {
    return this._chainState.connect()
  }

  /** Returns chain type enum - resolves to chain family as a string e.g. 'polkadot' */
  public get chainType(): ChainType {
    return ChainType.PolkadotV1
  }

  public  get chainId(): string {
    return this._chainState.chain
  }

  public get chainInfo(): ChainInfo {
    return this._chainState.chainInfo
  }

  public composeAction = async (
    actionType: ChainActionType | PolkadotChainActionType,
    args: any,
  ): Promise<PolkadotTransactionAction> => {
    notImplemented()
    return null
  }

  public decomposeAction = async (
    action: PolkadotTransactionAction
  ): Promise<PolkadotDecomposeReturn[]> => {
    notImplemented()
    return null
  }

  public get description(): string {
    return 'Polkadot Chain'
  }

  public get nativeToken(): { defaultUnit: string; symbol: PolkadotSymbol; tokenAddress: any } {
    return null
  }

  public async fetchBalance(
    account: PolkadotAddress,
    symbol: PolkadotSymbol,
    tokenAddress?: PolkadotAddress,
  ): Promise<{ balance: string }> {
    return this._chainState.fetchBalance(account)
  }

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

  private newAccount = async (address?: PolkadotAddress): Promise<PolkadotAccount> => {
    this.assertIsConnected()
    const account = new PolkadotAccount(this._chainState)
    if (address) {
      await account.load(address)
    }
    return account
  }

  private newCreateAccount = (options?: PolkadotCreateAccountOptions): any => {
    this.assertIsConnected()
    return new PolkadotCreateAccount(this._chainState, options)
  }
  
  private newTransaction = (options?: any): PolkadotTransaction => {
    this.assertIsConnected()
    return new PolkadotTransaction(this._chainState, options)
  }

  public new = {
    Account: this.newAccount,
    CreateAccount: this.newCreateAccount,
    Transaction: this.newTransaction,
  }

  public isValidEntityName = (value: string): boolean => {
    notImplemented()
    return false
  }

  public isValidDate = (value: string): boolean => {
    notImplemented()
    return false
  }

  public toEntityName = (value: string): ChainEntityName => {
    return toEthereumEntityName(value) as ChainEntityName
  }

  public toDate = (value: string | Date ): ChainDate => {
    return toEthereumDate(value) as ChainDate
  }

  public setPublicKey = (publicKey: PolkadotPublicKey) => {
    notImplemented()
    return ''
  }

  public mapChainError = (error: Error): ChainError => {
    notImplemented()
    return new ChainError(null, null, null, error)
  }

  public assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throw new Error('Not connected to chain')
    }
  }

  cryptoCurve: CryptoCurve.Ed25519

  decryptWithPassword = ethcrypto.decryptWithPassword
  encryptWithPassword = ethcrypto.encryptWithPassword
  decryptWithPrivateKey = ethcrypto.decryptWithPrivateKey
  encryptWithPublicKey = ethcrypto.encryptWithPublicKey
  decryptWithPrivateKeys = ethcrypto.decryptWithPrivateKeys
  encryptWithPublicKeys = ethcrypto.encryptWithPublicKeys
  getPublicKeyFromSignature = ethcrypto.getEthereumPublicKeyFromSignature
  generateKeyPair = ethcrypto.generateKeyPair
  isSymEncryptedDataString = ethcrypto.isSymEncryptedDataString
  isAsymEncryptedDataString = Asymmetric.isAsymEncryptedDataString
  toAsymEncryptedDataString = Asymmetric.toAsymEncryptedDataString
  toSymEncryptedDataString = ethcrypto.toSymEncryptedDataString
  toPublicKey = toEthereumPublicKey
  toPrivateKey = toEthereumPrivateKey
  toSignature = toEthereumSignature
  
  sign = ethcrypto.sign
  verifySignedWithPublicKey = ethcrypto.verifySignedWithPublicKey

  isValidPrivateKey = isValidEthereumPrivateKey
  isValidPublicKey = isValidEthereumPublicKey
  isValidEthereumDate = isValidEthereumDateString
}

export { ChainPolkadotV1 }