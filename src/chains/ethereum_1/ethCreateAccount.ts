import { EthereumChainState } from './ethChainState'
import { throwNewError } from '../../errors'
import { CreateAccount } from '../../interfaces'
import { getEthereumAddressFromPublicKey, generateNewAccountKeysAndEncryptPrivateKeys } from './ethCrypto'
import { isValidEthereumPublicKey } from './helpers'
import { isNullOrEmpty, notSupported } from '../../helpers'
import {
  EthereumAddress,
  EthereumCreateAccountOptions,
  EthereumEntityName,
  EthereumGeneratedKeys,
  EthereumNewAccountType,
  EthereumPublicKey,
} from './models'

/** Helper class to compose a transction for creating a new chain account
 *  Handles native accounts
 *  Generates new account keys if not provide */
export class EthereumCreateAccount implements CreateAccount {
  private _accountName: EthereumAddress

  private _chainState: EthereumChainState

  private _accountType: EthereumNewAccountType

  private _options: EthereumCreateAccountOptions

  requiresTransaction: boolean = false

  private _generatedKeys: EthereumGeneratedKeys

  constructor(chainState: EthereumChainState, options?: EthereumCreateAccountOptions) {
    this._chainState = chainState
    this._options = options
  }

  // ---- Interface implementation

  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  get accountName(): any {
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
    return false
  }

  /** Ethereum account creation doesn't require any on chain transactions.
   * Hence there is no transaction object attached to EthereumCreateAccount class
   */
  get transaction(): any {
    throwNewError(
      'Ethereum account creation does not require any on chain transactions. You should always first check the supportsTransactionToCreateAccount property - if false, transaction is not supported/required for this chain type',
    )
    return null
  }

  /** Compose a transaction to send to the chain to create a new account
   * Ethereum does not require a create account transaction to be sent to the chain
   */
  async composeTransaction(): Promise<void> {
    notSupported('CreateAccount.composeTransaction')
  }

  /** Determine if desired account name is usable for a new account.
   */
  async determineNewAccountName(): Promise<any> {
    // TODO ETH
    notSupported('CreateAccount.determineNewAccountName')
  }

  /* Not supported for Ethereum */
  async generateAccountName(): Promise<EthereumEntityName> {
    // TODO ETH
    notSupported('CreateAccount.generateAccountName')
    return null
  }

  // TODO ETH
  async generateAccountNameString(): Promise<string> {
    notSupported('CreateAccount.generateAccountNameString')
    return ''
  }

  /** Checks create options - if publicKeys are missing,
   *  autogenerate the public and private key pair and add them to options */
  async generateKeysIfNeeded() {
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
    this._accountType = EthereumNewAccountType.Native
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
    const { newKeysOptions } = this._options
    const { password } = newKeysOptions || {}
    if (isNullOrEmpty(password)) {
      throwNewError('Invalid Option - You must provide a password to generate new keys')
    }
  }
}
