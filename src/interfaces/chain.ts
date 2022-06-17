import { ChainError } from '../errors'
import { Transaction } from './transaction'
import { CreateAccount } from './createAccount'
import { Account } from './account'
import { Asymmetric, GenericCrypto } from '../crypto'
import { ChainJsPlugin, ChainJsPluginOptions } from './plugin'
import {
  ChainDate,
  ChainEndpoint,
  ChainEntityName,
  ChainInfo,
  ChainSymbol,
  ChainType,
  CryptoCurve,
  KeyPair,
  PrivateKey,
  PublicKey,
  Signature,
  TransactionExpirationOptions,
  TransactionOptions,
  TransactionStatus,
} from '../models'
import { AsymmetricEncryptedData } from '../crypto/asymmetricModels'

/** The Chain interface declares the operations that all concrete chains must implement */
export interface Chain {
  /** Return unique chain ID string */
  chainId: string
  /** Retrieve lastest chain info including head block number and time */
  chainInfo: ChainInfo
  /** Returns last datetime chain info was retrieved */
  isConnected: boolean
  /** Returns chain type enum - resolves to chain family as a string e.g. 'eos' */
  chainType: ChainType
  /** Returns chain plug-in name */
  description: string
  /** Returns chain rpc endpoints */
  endpoints: ChainEndpoint[]
  /** Returns the native (default) asset symbol for the chain and default token address (if any) */
  nativeToken: { defaultUnit: string; symbol: ChainSymbol; tokenAddress: any; precision: number }
  /** Connect to chain endpoint to verify that it is operational and to get latest block info */
  connect(): Promise<void>
  /** Compose an object for a chain contract action */
  composeAction(chainActionType: any, args: any): Promise<any>
  /** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
  decomposeAction(action: any): Promise<{ chainActionType: any; args: any; partial?: boolean }[]>
  /** Transaction expiration constraints */
  transactionExpirationOptions: TransactionExpirationOptions
  /** Fetch balance for token (or native chain asset)
   * If no value is provided for contract, some chains use the default token contract
   * Returns a string to allow for large numbers */
  fetchBalance(account: ChainEntityName, symbol: ChainSymbol, tokenAddress?: any): Promise<{ balance: string }>
  /** Fetch data from an on-chain contract table */
  fetchContractData(
    contract: string,
    table: string,
    owner: string,
    indexNumber?: number,
    lowerRow?: number,
    upperRow?: number,
    limit?: number,
    reverseOrder?: boolean,
    showPayer?: boolean,
    keyType?: string,
  ): Promise<any>
  /** Returns a new instance of an object */
  new: {
    /** Returns a new chain Account object
     * If an account name is provided, it will be fetched from the chain and loaded into the returned account object
     * Note: Does NOT create a new account - to create an account, use new.CreateAccount */
    Account(accountName?: string): Promise<Account>
    /** Return a new CreateAccount object used to help with creating a new chain account */
    CreateAccount(options?: any): Promise<CreateAccount>
    /** Return a chain Transaction object used to compose and send transactions */
    Transaction(options?: TransactionOptions): Promise<Transaction>
  }

  // Transaction functions
  fetchTransaction(transactionId: string): Promise<{ status: TransactionStatus; transaction: any }>

  // Chain Crypto functions
  /** Primary cryptography curve used by this chain */
  cryptoCurve: CryptoCurve
  /** Decrypts the encrypted value using a password, and optional salt using AES algorithm and SHA256 hash function
   * Expects the encrypted value to be a stringified JSON object */
  decryptWithPassword(encrypted: GenericCrypto.SymmetricEncryptedDataString, password: string, options?: any): string
  /** Encrypts a string using a password and optional salt using AES algorithm and SHA256 hash function
   * The returned, encrypted value is a stringified JSON object */
  encryptWithPassword(unencrypted: string, password: string, options?: any): GenericCrypto.SymmetricEncryptedDataString
  /** Decrypts the encrypted value using a private key
   * The encrypted value is a stringified JSON object
   * ... and must have been encrypted with the public key that matches the private ley provided */
  decryptWithPrivateKey(
    encrypted: Asymmetric.AsymmetricEncryptedDataString,
    privateKey: PrivateKey,
    options?: any,
  ): Promise<string>
  /** Encrypts a string using a public key into a stringified JSON object
   * The encrypted result can be decrypted with the matching private key */
  encryptWithPublicKey(
    unencrypted: string,
    publicKey: PublicKey,
    options?: any,
  ): Promise<Asymmetric.AsymmetricEncryptedDataString>
  /** Encrypts a string by wrapping it with successive asymmetric encryptions with multiple public key
   *  Operations are performed in the order that the public keys appear in the array
   *  Only the last item has the final, wrapped, ciphertext
   *  The encrypted result can be decrypted with the matching private keys in the inverse order */
  encryptWithPublicKeys(
    unencrypted: string,
    publicKeys: PublicKey[],
    options?: any,
  ): Promise<Asymmetric.AsymmetricEncryptedDataString>
  /** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string (or the remaining encrypted payload)
   *  each pass uses a private keys from privateKeys array - in the order appearing in the array - in same order of public keys provided to encryptWithPublicKeys() - they will be applied in the right (reverse) order
   *  If only some of the private keys are provided, if most be the last n keys (provided in same order as when encrypted) e.g. [key3, key4] where key1, key2 will be used later to finish decrypting the remaining payload
   *  Returns:    decrypted - If all keys were provided. The result is the original string that was encrypted
   *           OR remaining - If only some of the private keys provided. Returns array of encrypted blobs that are remaining after unwrapping with the private keys provided */
  decryptWithPrivateKeys(
    encrypted: Asymmetric.AsymmetricEncryptedDataString,
    privateKeys: PrivateKey[],
    options?: any,
  ): Promise<{ decrypted: string; remaining: AsymmetricEncryptedData[] }>
  /** Generates and returns a new public/private key pair */
  generateKeyPair(): Promise<KeyPair>
  /** Returns a public key given a signature and the original data was signed */
  getPublicKeyFromSignature(signature: Signature, data: string | Buffer): PublicKey
  /** Verifies that the value is a valid, stringified JSON encryption result */
  isAsymEncryptedDataString(value: string): boolean
  /** Generate a signature given some data and a private key */
  isSymEncryptedDataString(value: string): boolean
  /** Verifies that the value is a valid, stringified JSON asymmetric encryption result */
  isValidPrivateKey(value: string | Buffer): boolean
  /** Verifies that the value is a valid public key for the chain */
  isValidPublicKey(value: string | Buffer): boolean
  /** Generate a signature given some data and a private key */
  sign(data: string | Buffer, privateKey: PrivateKey): any
  /** Signs data as a message using private key (first appending additional required data if any) */
  signMessage(data: string | Buffer, privateKey: PrivateKey): any
  /** Whether chain supports ability to get a publicKey from a signature */
  supportsGetPublicKeyFromSignature: boolean
  /** Whether the chain supports resources */
  supportsResources: boolean
  /** Verify that a 'personal message' was signed using the given key (signed with the private key for the provided public key)
   * This differs from verifySignedWithPublicKey() because a message might include additional strings appended (as required by chain best-practices) */
  verifySignedMessage(data: string | Buffer, publicKey: PublicKey, signature: Signature): boolean
  /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
  verifySignedWithPublicKey(data: string | Buffer, publicKey: PublicKey, signature: Signature): boolean

  // Chain Helper functions

  /** Verifies that the value is a valid chain entity name (e.g. an account name) */
  isValidEntityName(value: string): boolean
  /** Verifies that the value is a valid chain date */
  isValidDate(value: string): boolean
  /** Ensures that the value comforms to a well-formed chain entity name (e.g. an account name) */
  toEntityName(value: string): ChainEntityName
  /** Ensures that the value comforms to a well-formed chain date string */
  toDate(value: string | Date): ChainDate
  /** Ensures that the value comforms to a well-formed public Key */
  toPublicKey(value: string): PublicKey
  /** Ensures that the value comforms to a well-formed private Key */
  toPrivateKey(value: string): PrivateKey
  /** Ensures that the value comforms to a well-formed stringified JSON encryption result */
  toAsymEncryptedDataString(value: any): Asymmetric.AsymmetricEncryptedDataString
  /** Ensures that the value comforms to a well-formed encrypted stringified JSON object */
  toSymEncryptedDataString(value: any): GenericCrypto.SymmetricEncryptedDataString
  /** Ensures that the value comforms to a well-formed signature */
  toSignature(value: string): Signature

  /** Transforms a chain-specfic error type (e.g. RpcError on EOS) to a 'standard' error type (ChainError) that includes additional chain insights */
  mapChainError(error: Error): ChainError

  /** adds a plugin (instantiated seperately) to the chain */
  installPlugin(plugin: ChainJsPlugin, options?: ChainJsPluginOptions): Promise<void>
}
