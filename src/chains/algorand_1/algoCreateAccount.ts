import { throwNewError } from '../../errors'
import { CreateAccount } from '../../interfaces'
import { isNullOrEmpty, notSupported } from '../../helpers'
import {
  AlgorandCreateAccountOptions,
  AlgorandEntityName,
  AlgorandGeneratedKeys,
  AlgorandNewAccountType,
  AlgorandPublicKey,
} from './models'
import { AlgorandChainState } from './algoChainState'
import { generateNewAccountKeysAndEncryptPrivateKeys } from './algoCrypto'
import { isValidAlgorandPublicKey, toAddressFromPublicKey, toAlgorandEntityName } from './helpers'
import { AlgorandMultisigPluginCreateAccount } from './plugins/multisig/algorandMultisigPlugin'
import { MultisigPlugin } from '../../interfaces/plugins/multisig'

/** Helper class to compose a transction for creating a new chain account
 *  Handles native accounts
 *  Generates new account keys if not provide */
export class AlgorandCreateAccount implements CreateAccount {
  private _publicKey: AlgorandPublicKey

  private _chainState: AlgorandChainState

  private _accountType: AlgorandNewAccountType

  private _options: AlgorandCreateAccountOptions

  private _generatedKeys: AlgorandGeneratedKeys

  private _multisigPlugin: MultisigPlugin

  private _multisigCreateAccount: AlgorandMultisigPluginCreateAccount

  constructor(chainState: AlgorandChainState, multisigPlugin?: MultisigPlugin, options?: AlgorandCreateAccountOptions) {
    this._chainState = chainState
    this.assertValidOptions(options)
    this._options = options || {}
    if (!isNullOrEmpty(this.options?.multisigOptions)) {
      this._multisigPlugin = multisigPlugin
    }
  }

  public async init() {
    if (this.multisigPlugin) {
      this._multisigCreateAccount = await this.multisigPlugin.new.CreateAccount(this.options?.multisigOptions)
    }
  }

  get multisigPlugin(): MultisigPlugin {
    return this._multisigPlugin
  }

  get multisigCreateAccount(): AlgorandMultisigPluginCreateAccount {
    return this._multisigCreateAccount
  }

  /** Returns whether the transaction is a multisig transaction */
  public get isMultisig(): boolean {
    return !isNullOrEmpty(this.multisigPlugin)
  }

  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  get accountName(): AlgorandEntityName {
    if (this.isMultisig) {
      return this.multisigCreateAccount.accountName
    }
    if (this._publicKey) {
      return toAlgorandEntityName(toAddressFromPublicKey(this._publicKey))
    }
    return null
  }

  /** Account type to be created */
  get accountType(): AlgorandNewAccountType {
    return this._accountType
  }

  /** Account will be recycled (accountName must be specified via composeTransaction()
   * This is set by composeTransaction()
   * ... if the account name provided has the 'unused' key as its active public key */
  get didRecycleAccount() {
    return false
  }

  /** The keys that were generated as part of the account creation process
   *  IMPORTANT: Be sure to always read and store these keys after creating an account
   *  This is the only way to retrieve the auto-generated private keys after an account is created */
  get generatedKeys() {
    if (this._generatedKeys) {
      return this._generatedKeys
    }
    return null
  }

  /** Account creation options */
  get options(): AlgorandCreateAccountOptions {
    return this._options
  }

  /** Algorand does not require the chain to execute a createAccount transaction
   *  to create the account structure on-chain */
  get supportsTransactionToCreateAccount(): boolean {
    return this.isMultisig ? this.multisigCreateAccount.requiresTransaction : false
  }

  /** Algorand account creation doesn't require any on chain transactions.
   * Hence there is no transaction object attached to AlgorandCreateAccount class
   */
  get transaction(): any {
    if (this.isMultisig) {
      return this.multisigCreateAccount.transactionAction
    }
    throwNewError(
      'Algorand account creation does not require any on chain transactions. You should always first check the supportsTransactionToCreateAccount property - if false, transaction is not supported/required for this chain type',
    )
    return null
  }

  /** Compose a transaction to send to the chain to create a new account
   * Algorand does not require a create account transaction to be sent to the chain
   */
  async composeTransaction(): Promise<void> {
    notSupported('CreateAccount.composeTransaction')
  }

  // TODO: Support recycling & alreadyExists
  /** Determine if desired account name is usable for a new account.
   * Recycling is not supported for now. Will be supported in the future.
   */
  async determineNewAccountName(accountName: AlgorandEntityName): Promise<any> {
    return { alreadyExists: false, newAccountName: accountName, canRecycle: false }
  }

  /** Returns the Algorand Address as AlgorandEntityName for the public key provided in options -
     OR generates a new private/public/address 
     Updates generatedKeys for the newly generated name (since name/account is derived from publicKey) */
  async generateAccountName(): Promise<AlgorandEntityName> {
    const accountName = await this.generateAccountNameString()
    return toAlgorandEntityName(accountName)
  }

  /* Returns a string of the Algorand Address for the public key provide in options - OR generates a new private/public/address */
  async generateAccountNameString(): Promise<string> {
    await this.generateKeysIfNeeded()
    return this.accountName as string
  }

  /** Checks create options - if both publicKey and multisigOptions are missing,
   *  autogenerate the public and private key pair and add them to options
   *  Algorand keys are represented as hex strings in chainjs.
   *  These keys are converted to Uint8Array when passed to Algorand sdk and nacl (crypto library for algorand).
   */
  async generateKeysIfNeeded() {
    this.assertMultisigPlugIsInitialized()
    this.assertValidOptionNewKeys()
    if (!this._publicKey) {
      // get keys from options or generate
      if (!this.isMultisig) {
        await this.generateAccountKeys()
      }
    }
    this._accountType = AlgorandNewAccountType.Native
  }

  // ---- Private functions
  private async generateAccountKeys(): Promise<void> {
    const { newKeysOptions } = this._options || {}
    const { password, encryptionOptions } = newKeysOptions || {}
    this._generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(password, encryptionOptions)
    this._publicKey = this._generatedKeys?.publicKey // replace working keys with new ones
  }

  /** make sure all options passed-in are valid */
  private assertValidOptions(options: AlgorandCreateAccountOptions) {
    const { publicKey } = options
    if (publicKey && !isValidAlgorandPublicKey(publicKey)) {
      throwNewError('Invalid Option - Provided publicKey isnt valid')
    }
  }

  /** Before encrypting keys, check for required options (password and salt) */
  private assertValidOptionNewKeys() {
    const { newKeysOptions } = this._options || {}
    const { password, encryptionOptions } = newKeysOptions || {}
    if (!password || !encryptionOptions) {
      throwNewError('Invalid Option - Missing password or encryptionOptions to use for generateKeysIfNeeded')
    }
  }

  /** Before encrypting keys, check for required options (password and salt) */
  private assertMultisigPlugIsInitialized() {
    if (!this._multisigPlugin.isInitialized) {
      throwNewError('AlgorandCreateAccount error - multisig plugin is not initialized')
    }
  }
}
