import { ChainError } from '../errors'
import { Transaction } from './transaction'
import { CreateAccount } from './createAccount'
import { Account } from './account'
import { ChainInfo, ChainType } from '../models'

/** The Chain interface declares the operations that all concrete chains must implement */
export interface Chain {
  // Enum list of chain actions that can be generated using composeAction()
  ChainActionType: any
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
  /** Connect to chain endpoint to verify that it is operational and to get latest block info */
  connect(): Promise<void>
  /** Compose an object for a chain contract action */
  composeAction(chainActionType: any, args: any): any
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
  /** Chain cryptography functions */
  crypto: {
    /** Decrypts the encrypted value using a password, and salt using AES algorithm and SHA256 hash function
     * Expects the encrypted value to be a stringified JSON object */
    decrypt(encrypted: string, password: string, salt: string): string
    /** Encrypts a string using a password and salt using AES algorithm and SHA256 hash function
     * The returned, encrypted value is a stringified JSON object */
    encrypt(unencrypted: string, password: string, salt: string): string
    /** Returns a public key given a signature and the original data was signed */
    getPublicKeyFromSignature(signature: string | Buffer, data: string | Buffer, encoding: string): string
    /** Verifies that the value is a valid, stringified JSON ciphertext */
    isValidEncryptedData(value: string): boolean
    /** Generate a signature given some data and a private key */
    isValidPrivateKey(value: string): boolean
    /** Verifies that the value is a valid public key for the chain */
    isValidPublicKey(value: string): boolean
    /** Generate a signature given some data and a private key */
    sign(data: string | Buffer, privateKey: string, encoding: string): string
    /** Verify that the signed data was signed using the given key (signed with the private key for the provided public key) */
    verifySignedWithPublicKey(publicKey: string | Buffer, data: string | Buffer, encoding: string): boolean
  }
  /** Returns a new instance of an object */
  new: {
    /** Returns a new chain Account object
     * Note: Does NOT create a new account - to create an account, use new.createAccount */
    account(accountName: any): Promise<Account>
    /** Return a new CreateAccount object used to help with creating a new chain account */
    createAccount(): CreateAccount
    /** Return a chain Transaction object used to compose and send transactions */
    transaction(options?: any): Transaction
  }

  /** Transforms a chain-specfic error type (e.g. RpcError on EOS) to a 'standard' error type (ChainError) that includes additional chain insights */
  mapChainError(error: Error): ChainError
}
