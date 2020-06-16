import { ChainEndpoint, ChainInfo, ChainType } from '../../models'
import { throwNewError } from '../../errors'
import { Chain } from '../../interfaces'
import { AlgorandChainSettings } from './models/generalModels'
import { AlgorandChainState } from './algoChainState'
import * as algoCrypto from './algoCrypto'

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
  public get chainInfo(): ChainInfo {
    this.assertIsConnected()
    return this._chainState.chainInfo
  }

  /** Fetch data from an on-chain contract table */
  public fetchContractData = (): any => {
    // ALGOTODO
  }

  /** Compose an object for a chain contract action */
  public composeAction = (): any => {
    // ALGOTODO
  }

  /** Decompose a contract action and return the action type (if any) and its data */
  public decomposeAction = (): any => {
    // ALGOTODO
  }

  /** Returns a chain Account class
   * Note: Does NOT create a new account - to create an account, use new.CreateAccount */
  private newAccount = (): any => {
    // ALGOTODO
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private newCreateAccount(): any {
    // ALGOTODO
  }

  /** Return a ChainTransaction class used to compose and send transactions */
  private newTransaction(): any {
    // ALGOTODO
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
    // ALGOTODO
  }

  /** Verifies that the value is a valid, stringified JSON ciphertext */
  isValidEncryptedData = algoCrypto.isEncryptedDataString

  /** Ensures that the value comforms to a well-formed private Key */
  toEncryptedDataString = algoCrypto.toEncryptedDataString

  /** Ensures that the value comforms to a well-formed private Key */
  public isValidPrivateKey = (): any => {
    // ALGOTODO
  }

  /** Ensures that the value comforms to a well-formed public Key */
  public isValidPublicKey = (): any => {
    // ALGOTODO
  }

  /** Generate a signature given some data and a private key */
  sign = algoCrypto.sign

  /** Generates new key pairs (public and private)
   *  Encrypts private key with provided password
   *  Returns: { privateKey, publicKey } */
  generateNewAccountKeysWithEncryptedPrivateKeys = algoCrypto.generateNewAccountKeysAndEncryptPrivateKeys

  /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
  verifySignedWithPublicKey = (): any => {
    // ALGOTODO
  }

  // --------- Chain helper functions

  /** Verifies that the value is a valid chain entity name (e.g. an account name) */
  public isValidEntityName = (): any => {
    // ALGOTODO
  }

  /** Verifies that the value is a valid chain asset string */
  public isValidAsset = (): any => {
    // ALGOTODO
  }

  /** Verifies that the value is a valid chain date */
  public isValidDate = (): any => {
    // ALGOTODO
  }

  /** Ensures that the value comforms to a well-formed chain asset string */
  public toAsset = (): any => {
    // ALGOTODO
  }

  /** Ensures that the value comforms to a well-formed chain entity name (e.g. an account name) */
  public toEntityName = (): any => {
    // ALGOTODO
  }

  /** Ensures that the value comforms to a well-formed chain date string */
  public toDate = (): any => {
    // ALGOTODO
  }

  /** Ensures that the value comforms to a well-formed public Key */
  public toPublicKey = (): any => {
    // ALGOTODO
  }

  /** Ensures that the value comforms to a well-formed private Key */
  public toPrivateKey = (): any => {
    // ALGOTODO
  }

  /** Ensures that the value comforms to a well-formed EOS signature */
  public toSignature = (): any => {
    // ALGOTODO
  }

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

  /** Whether any info has been retrieved from the chain */
  public get isConnected(): boolean {
    return this._chainState?.isConnected
  }

  /** Map error from chain into a well-known ChainError type */
  public mapChainError = (): any => {}

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      throwNewError('Not connected to chain')
    }
  }
}

export { ChainAlgorandV1 }
