import { EthereumChainState } from './ethChainState'
import { throwNewError } from '../../errors'
import { CreateAccount } from '../../interfaces'
import { getEthereumAddressFromPublicKey, generateNewAccountKeysAndEncryptPrivateKeys } from './ethCrypto'
import { isValidEthereumPublicKey, toEthereumEntityName } from './helpers'
import { isNullOrEmpty, notSupported } from '../../helpers'
import {
  EthereumAddress,
  EthereumCreateAccountOptions,
  EthereumEntityName,
  EthereumGeneratedKeys,
  EthereumNewAccountType,
  EthereumPublicKey,
} from './models'
import { EthereumMultisigPluginCreateAccount } from './plugins/multisig/ethereumMultisigPlugin'
import { EthereumTransaction } from './ethTransaction'
import { MultisigPlugin } from '../../interfaces/plugins/multisig'

/** Helper class to compose a transction for creating a new chain account
 *  Handles native accounts
 *  Generates new account keys if not provide */
export class EthereumCreateAccount implements CreateAccount {
  private _accountName: EthereumAddress

  private _chainState: EthereumChainState

  private _multisigPlugin: MultisigPlugin

  private _multisigCreateAccount: EthereumMultisigPluginCreateAccount

  private _accountType: EthereumNewAccountType

  private _options: EthereumCreateAccountOptions<any>

  private _generatedKeys: EthereumGeneratedKeys

  private _transaction: EthereumTransaction

  constructor(
    chainState: EthereumChainState,
    multisigPlugin?: MultisigPlugin,
    options?: EthereumCreateAccountOptions<any>,
  ) {
    this._chainState = chainState
    this._options = options || {}
    if (!isNullOrEmpty(options?.multisigOptions)) {
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

  get multisigCreateAccount(): EthereumMultisigPluginCreateAccount {
    return this._multisigCreateAccount
  }

  // ---- Interface implementation

  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  get accountName(): EthereumAddress {
    if (this.isMultisig) {
      return this.multisigCreateAccount.accountName
    }
    return this._accountName
  }

  /** Account type to be created */
  get accountType(): EthereumNewAccountType {
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
  get options() {
    return this._options
  }

  /** ETH does not require the chain to execute a createAccount transaction
   *  to create the account structure on-chain */
  get supportsTransactionToCreateAccount(): boolean {
    return this.isMultisig ? this.multisigCreateAccount.requiresTransaction : false
  }

  /** Returns whether the transaction is a multisig transaction */
  public get isMultisig(): boolean {
    return !isNullOrEmpty(this.multisigPlugin)
  }

  public get requiresTransaction(): boolean {
    return this.isMultisig ? this.multisigCreateAccount.requiresTransaction : false
  }

  /** If not multisig: ethereum account creation doesn't require any on chain transactions.
   * If multisig, it checks if transaction to chain is required, returns chain transaction if true
   */
  get transaction(): EthereumTransaction {
    if (this.requiresTransaction) {
      if (!this._transaction) {
        this._transaction = new EthereumTransaction(this._chainState)
      }
      return this._transaction
    }
    throwNewError(
      'Ethereum account creation does not require any on chain transactions if not Multisig. You should always first check the supportsTransactionToCreateAccount property - if false, transaction is not supported/required for this chain type',
    )
    return null
  }
  /** The transaction with all actions needed to create the account
   *  This should be signed and sent to the chain to create the account */

  /** Compose a transaction to send to the chain to create a new account
   * Ethereum may only require a create account transaction to be sent
   * If creating multisig account
   */
  async composeTransaction(): Promise<void> {
    if (this.isMultisig) {
      const multisigTransactionAction = this.multisigCreateAccount.transactionAction
      const newTransaction = new EthereumTransaction(this._chainState)
      newTransaction.actions = [multisigTransactionAction]
      await newTransaction.prepareToBeSigned()
      await newTransaction.validate()
      this._transaction = newTransaction
    } else {
      notSupported('CreateAccount.composeTransaction')
    }
  }

  // TODO: support alreadyExists
  /** Determine if desired account name is usable for a new account.
   * Recycling is not supported on Ethereum
   */
  async determineNewAccountName(accountName: EthereumEntityName): Promise<any> {
    return { alreadyExists: false, newAccountName: accountName, canRecycle: false }
  }

  /** Returns the Ethereum Address as EthereumEntityName for the public key provided in options
    OR generates a new private/public/address 
    Updates generatedKeys for the newly generated name (since name/account is derived from publicKey */
  async generateAccountName(): Promise<EthereumEntityName> {
    const accountName = await this.generateAccountNameString()
    return toEthereumEntityName(accountName)
  }

  /* Returns a string of the Ethereum Address for the public key provide in options - OR generates a new private/public/address */
  async generateAccountNameString(): Promise<string> {
    await this.generateKeysIfNeeded()
    return this.accountName as string
  }

  /** Checks create options - if publicKeys are missing,
   *  autogenerate the public and private key pair and add them to options */
  async generateKeysIfNeeded() {
    if (this.isMultisig) {
      await this.multisigCreateAccount.generateKeysIfNeeded()
    } else {
      let publicKey: EthereumPublicKey
      this.assertValidOptionPublicKeys()
      this.assertValidOptionNewKeys()
      // get keys from options or generate
      publicKey = this?._options?.publicKey
      if (!publicKey) {
        await this.generateAccountKeys()
        publicKey = this._generatedKeys?.publicKey
      }
      this._accountName = await getEthereumAddressFromPublicKey(publicKey)
      // TODO: figure out how to handle accountType for multisig
      this._accountType = EthereumNewAccountType.Native
    }
  }

  // ---- Private functions

  private async generateAccountKeys(): Promise<void> {
    const { newKeysOptions } = this._options || {}
    const { password, encryptionOptions } = newKeysOptions || {}
    this._generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(password, {}, encryptionOptions)
    this._options.publicKey = this._generatedKeys?.publicKey // replace working keys with new ones
  }

  private assertValidOptionPublicKeys() {
    const { publicKey } = this._options
    if (publicKey && !isValidEthereumPublicKey(publicKey)) {
      throwNewError('Invalid Option - Provided publicKey isnt valid')
    }
  }

  private assertValidOptionNewKeys() {
    // nothing to check
  }
}
