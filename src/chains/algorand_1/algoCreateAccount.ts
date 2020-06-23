import { throwNewError } from '../../errors'
import { CreateAccount } from '../../interfaces'
import { isNullOrEmpty, notSupported } from '../../helpers'
import { AlgorandAddress, AlgorandPublicKey } from './models/cryptoModels'
import { AlgorandChainState } from './algoChainState'
import { AlgorandNewAccountType, AlgorandCreateAccountOptions } from './models/accountModels'
import { AlgorandGeneratedKeys, AlgorandMultiSigOptions } from './models/generalModels'
import { isValidAlgorandPublicKey } from './helpers/cryptoModelHelpers'
import {
  getAddressFromPublicKey,
  generateMultiSigAddress,
  generateNewAccountKeysAndEncryptPrivateKeys,
} from './algoCrypto'

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
   *  autogenerate the public and private key pair and add them to options */
  async generateKeysIfNeeded() {
    let publicKey: AlgorandPublicKey
    this.assertValidOptionPublicKeys()
    this.assertValidOptionNewKeys()

    const multiSigOptions = this.getMultiSigOptionsFromOptions()
    // if multisig options are given, then generate a multisig account using the passed in algorand addresses
    if (multiSigOptions) {
      await this.generateMultiSigAccountKeys()
      publicKey = this._generatedKeys?.publicKey
    } else {
      // get keys from options or generate
      publicKey = this.getPublicKeysFromOptions()
      if (!publicKey) {
        await this.generateAccountKeys()
        publicKey = this._generatedKeys?.publicKey
      }
    }
    this._accountName = await getAddressFromPublicKey(publicKey)
    this._accountType = AlgorandNewAccountType.Native
  }

  // ---- Private functions

  private async generateAccountKeys(): Promise<void> {
    const { newKeysOptions } = this._options || {}
    const { password } = newKeysOptions || {}
    this._generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(password)
    this._options.publicKey = this._generatedKeys?.publicKey // replace working keys with new ones
  }

  private async generateMultiSigAccountKeys(): Promise<void> {
    const { multiSigOptions } = this._options?.newKeysOptions || {}
    this._generatedKeys = await generateMultiSigAddress(multiSigOptions)
  }

  /** extract keys from options
   *  Returns publicKeys */
  private getPublicKeysFromOptions(): AlgorandPublicKey {
    const { publicKey } = this._options || {}
    if (!publicKey) {
      return null
    }
    return publicKey
  }

  /** extract multisig options from options
   *  Returns multisig options including version, threshhold and addresses */
  private getMultiSigOptionsFromOptions(): AlgorandMultiSigOptions {
    const { multiSigOptions } = this._options?.newKeysOptions || {}
    if (!multiSigOptions) {
      return null
    }
    return multiSigOptions
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
