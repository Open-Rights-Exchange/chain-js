import { EthereumChainState } from './ethChainState'
import { throwNewError } from '../../errors'
import { CreateAccount } from '../../interfaces'
import { generateNewAccountKeysAndEncryptPrivateKeys } from './ethCrypto'
import { isNullOrEmpty } from '../../helpers'
import { EthereumAddress } from './models/cryptoModels'
import { EthereumAccountStruct } from './models/ethStructures'
import { EthereumNewAccountType, EthereumCreateAccountOptions } from './models/accountModels'
import { EthereumTransaction } from './ethTransaction'
/** Helper class to compose a transction for creating a new chain account
 *  Handles native accounts
 *  Generates new account keys if not provide */
export class EthereumCreateAccount implements CreateAccount {
  private _accountName: EthereumAddress

  private _chainState: EthereumChainState

  private _didRecycleAccount: boolean

  private _accountType: EthereumNewAccountType

  private _options: EthereumCreateAccountOptions

  requiresTransaction: boolean = false

  private _generatedKeys: EthereumAccountStruct

  constructor(chainState: EthereumChainState) {
    this._chainState = chainState
  }

  /** Compose a transaction to send to the chain to create a new account */
  // TODO
  async composeTransaction(accountType: EthereumNewAccountType, options?: EthereumCreateAccountOptions): Promise<void> {
    this.assertValidOptionNewKeys()
    throwNewError('Not supported')
  }

  /** Determine if desired account name is usable for a new account.
   *  Generates a new account name if one isnt provided.
   *  Checks if provided account is unused and can be recycled */
  // TODO: fix the return as this is not supported
  async determineNewAccountName(accountName: any): Promise<any> {
    this.assertValidOptionNewKeys()
    throwNewError('Not supported')
  }

  /** extract keys from options or generate new keys
   *  Returns publicKeys and generatedKeys if created */
  private async getPublicKeysFromOptionsOrGenerateNewKeys() {
    this._generatedKeys = await this.generateNewKeys()
    return this._generatedKeys.publicKey
  }

  private async generateNewKeys() {
    const { newKeysOptions } = this._options
    const { password, salt } = newKeysOptions || {}

    this._generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(password, salt, {})
    return this._generatedKeys
  }

  /** Generates a random EOS compatible account name and checks chain to see if it is arleady in use.
   *  If already in use, this function is called recursively until a unique name is generated */
  // TODO
  async generateAccountName(prefix: string, checkIfNameUsedOnChain: boolean = true): Promise<void> {
    this.assertValidOptionNewKeys()
    throwNewError('Not supported')
  }

  async generateAccount(accountType: EthereumNewAccountType, options?: EthereumCreateAccountOptions) {
    this._options = options
    if (accountType !== EthereumNewAccountType.Native) {
      throwNewError(`Only ${EthereumNewAccountType.Native} account type supported for ethereum`)
    }
    const account = await this.generateNewKeys()
    return account
  }

  // TODO
  // async doesAccountExist(accountName: EosEntityName): Promise<{ exists: boolean; account: EosAccount }> {
  //   const account = new EosAccount(this._chainState)
  //   return account.doesAccountExist(accountName)
  // }

  /** Generates a random EOS account name
    account names MUST be base32 encoded in compliance with the EOS standard (usually 12 characters)
    account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
    account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars
  */
  // TODO
  generateAccountNameString = (prefix: string = ''): any => {
    throwNewError('Not supported')
  }

  private assertValidOptionNewKeys() {
    const { newKeysOptions } = this._options
    const { password, salt } = newKeysOptions || {}
    if (isNullOrEmpty(password) || isNullOrEmpty(salt)) {
      throwNewError('Invalid Option - You must provide a password AND salt to generate new keys')
    }
  }

  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  get accountName(): any {
    return this._accountName
  }

  /** Account type to be created */
  get accountType(): EthereumNewAccountType {
    return this._accountType
  }

  /** Account creation options */
  get options() {
    return this._options
  }

  /** Account will be recycled (accountName must be specified via composeTransaction()
   * This is set by composeTransaction()
   * ... if the account name provided has the 'unused' key as its active public key */
  get didRecycleAccount() {
    return this._didRecycleAccount
  }

  /** The keys that were generated as part of the account creation process
   *  IMPORTANT: Bes ure to always read and store these keys after creating an account
   *  This is the only way to retrieve the auto-generated private keys after an account is created */
  get generatedKeys() {
    if (this._generatedKeys) {
      return this._generatedKeys
    }
    return null
  }

  /** The transaction with all actions needed to create the account
   *  This should be signed and sent to the chain to create the account */
  // TODO
  get transaction(): any {
    throwNewError('')
    return null
  }
}
