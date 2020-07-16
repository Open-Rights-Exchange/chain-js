import { throwNewError } from '../../errors'
import { CreateAccount } from '../../interfaces'
import { isNullOrEmpty, notSupported } from '../../helpers'
import {
  AlgorandAddress,
  AlgorandCreateAccountOptions,
  AlgorandGeneratedKeys,
  AlgorandNewAccountType,
  AlgorandPublicKey,
} from './models'
import { AlgorandChainState } from './algoChainState'
import { toAddressFromPublicKey, toMultiSigAddress, generateNewAccountKeysAndEncryptPrivateKeys } from './algoCrypto'
import { isValidAlgorandPublicKey } from './helpers'

/** Helper class to compose a transction for creating a new chain account
 *  Handles native accounts
 *  Generates new account keys if not provide */
export class AlgorandCreateAccount implements CreateAccount {
  private _accountName: AlgorandAddress

  private _chainState: AlgorandChainState

  private _accountType: AlgorandNewAccountType

  private _options: AlgorandCreateAccountOptions

  requiresTransaction: boolean = false

  private _generatedKeys: AlgorandGeneratedKeys

  constructor(chainState: AlgorandChainState, options?: AlgorandCreateAccountOptions) {
    this._chainState = chainState
    this._options = options
    const multiSigOptions = this?._options?.multiSigOptions
    // if multisig options are given, then compute a multisig account address using the passed in algorand addresses in multisig options
    if (multiSigOptions) {
      this._accountName = toMultiSigAddress(multiSigOptions)
    }
  }

  // ---- Interface implementation

  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  get accountName(): any {
    return this._accountName
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
    notSupported()
  }

  /** Determine if desired account name is usable for a new account.
   */
  async determineNewAccountName(): Promise<any> {
    notSupported()
  }

  /* Not supported for Algorand */
  async generateAccountName(): Promise<any> {
    notSupported()
    return null
  }

  /** Not supported */
  generateAccountNameString = (): any => {
    notSupported()
  }

  /** Checks create options - if publicKeys are missing,
   *  autogenerate the public and private key pair and add them to options
   *  Algorand keys are represented as hex strings in chainjs.
   *  These keys are converted to Uint8Array when passed to Algorand sdk and nacl (crypto library for algorand).
   */
  async generateKeysIfNeeded() {
    let publicKey: AlgorandPublicKey
    this.assertValidOptionPublicKeys()
    this.assertValidOptionNewKeys()

    const multiSigOptions = this?._options?.multiSigOptions
    // No new key pair is generated for multisig account
    if (!multiSigOptions) {
      // get keys from options or generate
      publicKey = this?._options?.publicKey
      if (!publicKey) {
        await this.generateAccountKeys()
        publicKey = this._generatedKeys?.publicKey
      }
      this._accountName = await toAddressFromPublicKey(publicKey)
    }
    this._accountType = AlgorandNewAccountType.Native
  }

  // ---- Private functions
  private async generateAccountKeys(): Promise<void> {
    const { newKeysOptions } = this._options || {}
    const { password, salt } = newKeysOptions || {}
    this._generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(password, salt)
    this._options.publicKey = this._generatedKeys?.publicKey // replace working keys with new ones
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
