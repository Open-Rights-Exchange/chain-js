import { Transaction } from './transaction'
import { AccountType, CreateAccountOptions, ChainEntityName } from '../models'

/**
 * The CreateAccount interface declares the operations that all concrete (chain)CreateAccount classes must implement
 */
export interface CreateAccount {
  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  accountName: ChainEntityName
  /** Account type to be created */
  accountType: AccountType | any
  /** Account will be recycled (accountName must be specified via composeTransaction()
   * This is set by composeTransaction()
   * ... if the account name provided has the 'unused' key as its active public key */
  didRecycleAccount: boolean
  /** The keys that were generated as part of the account creation process
   *  IMPORTANT: Bes ure to always read and store these keys after creating an account
   *  This is the only way to retrieve the auto-generated private keys after an account is created */
  generatedKeys: any
  /** Account creation options */
  options: CreateAccountOptions
  /** The transaction with all actions needed to create the account
   *  This should be signed and sent to the chain to create the account */
  transaction: Transaction
  /** Compose a transaction to send to the chain to create a new account */
  composeTransaction(
    accountType: AccountType | any,
    accountName?: ChainEntityName,
    options?: CreateAccountOptions,
  ): Promise<void>
  /** Determine if desired account name is usable for a new account.
   *  Generates a new account name if one isnt provided.
   *  If account is unused (active key = unusedAccountPublicKey) then returns canRecycle = true */
  determineNewAccountName(
    accountName: ChainEntityName,
  ): Promise<{ alreadyExists: boolean; newAccountName: string; canRecycle: boolean }>
  /** Generates a random EOS compatible account name and checks chain to see if it is arleady in use.
   *  If already in use, this function is called recursively until a unique name is generated */
  generateAccountName(prefix: string, checkIfNameUsedOnChain: boolean): Promise<ChainEntityName>
  /** Verifies that all accounts and permisison for actions exist on chain.
   *  Throws if any problems */
  /** Generates a random EOS account name
  account names MUST be base32 encoded in compliance with the EOS standard (usually 12 characters)
  account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
  account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars */
  generateAccountNameString(prefix: string): string
}
