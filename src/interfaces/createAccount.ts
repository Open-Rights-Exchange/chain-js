import { Transaction } from './transaction'
import { AccountType, CreateAccountOptions } from '../models'

/**
 * The CreateAccount interface declares the operations that all concrete (chain)CreateAccount classes must implement
 */
export interface CreateAccount {
  generatedKeys: any
  transaction: Transaction
  /** Compose a transaction to send to the chain to create a new account */
  composeTransaction(accountType: AccountType, accountName?: string, options?: CreateAccountOptions): Promise<void>
  /** Determine if desired account name is usable for a new account.
   *  Generates a new account name if one isnt provided.
   *  If account is unused (active key = unusedAccountPublicKey) then returns canRecycle = true */
  determineNewAccountName(
    accountName: string,
  ): Promise<{ alreadyExists: boolean; newAccountName: string; canRecycle: boolean }>
  /** Generates a random EOS compatible account name and checks chain to see if it is arleady in use.
   *  If already in use, this function is called recursively until a unique name is generated */
  generateAccountName(prefix: string, checkIfNameUsedOnChain: boolean): Promise<string>
  /** Verifies that all accounts and permisison for actions exist on chain.
   *  Throws if any problems */
  /** Generates a random EOS account name
  account names MUST be base32 encoded in compliance with the EOS standard (usually 12 characters)
  account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
  account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars */
  generateAccountNameString(prefix: string): string
}
