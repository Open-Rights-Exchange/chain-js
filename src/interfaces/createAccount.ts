import { Transaction } from './transaction'
import { NewAccountType, CreateAccountOptions, ChainEntityName } from '../models'

/**
 * The CreateAccount interface declares the operations that all concrete (chain)CreateAccount classes must implement
 */
export interface CreateAccount {
  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  accountName: ChainEntityName
  /** Account type to be created */
  accountType: NewAccountType | any
  /** Account will be recycled (accountName must be specified via composeTransaction()
   * This is set by composeTransaction()
   * ... if the account name provided has the 'unused' key as its active public key */
  didRecycleAccount: boolean
  /** The keys that were generated as part of the account creation process
   *  IMPORTANT: Be sure to always read and store these keys after creating an account
   *  This is the only way to retrieve the auto-generated private keys after an account is created */
  generatedKeys: any
  /** Account creation options */
  options: CreateAccountOptions
  /** The transaction with all actions needed to create the account
   *  This should be signed and sent to the chain to create the account */
  transaction: Transaction
  /** Compose a transaction to send to the chain to create a new account */
  composeTransaction(accountType: NewAccountType | any): Promise<void>
  /** Determine if desired account name is usable for a new account.
   *  Generates a new account name if one isnt provided.
   *  If account is unused (active key = unusedAccountPublicKey) then returns canRecycle = true */
  determineNewAccountName(
    accountName: ChainEntityName,
  ): Promise<{ alreadyExists: boolean; newAccountName: string; canRecycle: boolean }>
  /** Generates a random chain compatible account name (or address)
   *  Updates generatedKeys property with public/private key of new name/address (if account is realted to public key)
   *  If address can be queried on-chain, this checks chain to see if name is already in use
   *  If already in use, this function is called recursively until a unique name is generated */
  generateAccountName(prefix: string, checkIfNameUsedOnChain: boolean): Promise<ChainEntityName>
  /** Generates a random chain compatible account name (or address)
   *  Updates generatedKeys property with public/private key of new name/address (if account name is derived from public key) */
  generateAccountNameString(prefix: string): Promise<string>
  /** Checks if publicKeys are provide in Options
   *  If not, generates new public keys and stores them in class's generatedKeys property
   *  Also adds the new keys to the class's options.publicKeys property */
  generateKeysIfNeeded(): Promise<void>
  /** Whether chain requires a transaction to create an account
   *  ex: ETH does not, EOS does */
  supportsTransactionToCreateAccount: boolean
}
