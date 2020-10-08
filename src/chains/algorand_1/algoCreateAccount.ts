import { throwNewError } from '../../errors'
import { CreateAccount } from '../../interfaces'
import { isNullOrEmpty, notSupported } from '../../helpers'
import {
  AlgorandCreateAccountOptions,
  AlgorandEntityName,
  AlgorandGeneratedKeys,
  AlgorandMultiSigOptions,
  AlgorandNewAccountType,
  AlgorandPublicKey,
} from './models'
import { AlgorandChainState } from './algoChainState'
import { generateNewAccountKeysAndEncryptPrivateKeys } from './algoCrypto'
import {
  isValidAlgorandPublicKey,
  determineMultiSigAddress,
  toAddressFromPublicKey,
  toAlgorandEntityName,
} from './helpers'

/** Helper class to compose a transction for creating a new chain account
 *  Handles native accounts
 *  Generates new account keys if not provide */
export class AlgorandCreateAccount implements CreateAccount {
  private _publicKey: AlgorandPublicKey

  private _multiSigOptions: AlgorandMultiSigOptions

  private _chainState: AlgorandChainState

  private _accountType: AlgorandNewAccountType

  private _options: AlgorandCreateAccountOptions

  requiresTransaction: boolean = false

  private _generatedKeys: AlgorandGeneratedKeys

  constructor(chainState: AlgorandChainState, options?: AlgorandCreateAccountOptions) {
    this._chainState = chainState
    this._options = options
    this._publicKey = options?.publicKey
    this._multiSigOptions = options?.multiSigOptions || null
  }

  // ---- Interface implementation

  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  get accountName(): AlgorandEntityName {
    if (this._publicKey) {
      return toAlgorandEntityName(toAddressFromPublicKey(this._publicKey))
    }
    if (this._multiSigOptions) {
      return toAlgorandEntityName(determineMultiSigAddress(this._multiSigOptions))
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
  get options() {
    return this._options
  }

  /** Algorand does not require the chain to execute a createAccount transaction
   *  to create the account structure on-chain */
  get supportsTransactionToCreateAccount(): boolean {
    return false
  }

  /** Algorand account creation doesn't require any on chain transactions.
   * Hence there is no transaction object attached to AlgorandCreateAccount class
   */
  get transaction(): any {
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

  // TODO: Support recycling
  /** Determine if desired account name is usable for a new account.
   * Recycling is not supported for now.
   */
  async determineNewAccountName(accountName: AlgorandEntityName): Promise<any> {
    return { alreadyExists: false, newAccountName: accountName, canRecycle: false }
  }

  /** Returns a the Algorand Address as AlgorandEntityName brand for the public key provide in options -
     OR generates a new private/public/address 
     Updates generatedKeys for the newly generated name (since name/account is derived from publicKey */
  async generateAccountName(): Promise<AlgorandEntityName> {
    const accountName = await this.generateAccountNameString()
    return toAlgorandEntityName(accountName)
  }

  /* Returns a string of the Algorand Address for the public key provide in options - OR generates a new private/public/address */
  async generateAccountNameString(): Promise<string> {
    await this.generateKeysIfNeeded()
    return this.accountName as string
  }

  /** Checks create options - if both publicKey and multiSigOptions are missing,
   *  autogenerate the public and private key pair and add them to options
   *  Algorand keys are represented as hex strings in chainjs.
   *  These keys are converted to Uint8Array when passed to Algorand sdk and nacl (crypto library for algorand).
   */
  async generateKeysIfNeeded() {
    this.assertValidOptionPublicKeys()
    this.assertValidOptionNewKeys()
    if (!this._publicKey) {
      // get keys from options or generate
      if (!this._multiSigOptions) {
        await this.generateAccountKeys()
      }
    }
    this._accountType = AlgorandNewAccountType.Native
  }

  // ---- Private functions
  private async generateAccountKeys(): Promise<void> {
    const { newKeysOptions } = this._options || {}
    const { password } = newKeysOptions || {}
    this._generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(password, newKeysOptions)
    this._publicKey = this._generatedKeys?.publicKey // replace working keys with new ones
  }

  private assertValidOptionPublicKeys() {
    const { publicKey } = this._options
    if (publicKey && !isValidAlgorandPublicKey(publicKey)) {
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
