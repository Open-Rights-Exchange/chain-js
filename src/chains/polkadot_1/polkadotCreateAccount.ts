import { PolkadotCreateAccountOptions } from './models/accountModels'
import { PolkadotChainState } from './polkadotChainState'
import { generateKeyPair, generateNewAccountPhrase, getKeypairFromPhrase, getPolkadotAddressFromPublicKey } from './polkadotCrypto'
import { isValidPolkadotPublicKey, toPolkadotEntityName } from './helpers'
import { notSupported } from '../../helpers'
import { CreateAccount } from '../../interfaces'
import { throwNewError } from '../../errors'
import { PolkadotAddress, PolkadotPublicKey, PolkadotCurve, PolkadotKeypair } from './models'
import { DEFAULT_POLKADOT_KEY_PAIR_TYPE } from './polkadotConstants'

/** Helper class to compose a transaction for creating a new chain account
 *  Handles native accounts
 *  Generates new account keys if not provide
 */
export class PolkadotCreateAccount implements CreateAccount {
  private _accountName: PolkadotAddress

  private _accountType: PolkadotCurve

  private _chainState: PolkadotChainState

  private _options: PolkadotCreateAccountOptions

  private _generatedKeypair: PolkadotKeypair

  constructor(chainState: PolkadotChainState, options?: PolkadotCreateAccountOptions) {
    this._chainState = chainState
    this._options = options
  }

  /** Account name for the account to be created */
  public get accountName(): any {
    return this._accountName
  }

  /** Account type to be created */
  public get accountType(): PolkadotCurve {
    return this._accountType
  }

  /** Prefix that represents the address on which chain */
  public getSS58Format(): number {
    return this._chainState.chainInfo.nativeInfo.SS58
  }

  /** Whether the account was recycled - not supported in Polkadot */
  get didRecycleAccount() {
    return false
  }

  /** The keys that were generated as part of the account creation process
   *  IMPORTANT: Be sure to always read and store these keys after creating an account
   *  This is the only way to retrieve the auto-generated private keys after an account is created
   */
  get generatedKeys() {
    if (this._generatedKeypair) {
      return this._generatedKeypair
    }
    return null
  }

  /** Account creation options */
  get options() {
    return this._options
  }

  /** Polkadot account creation does not require any on chain transactions.
   *  Hence there is no transaction object attached to PolkadotCreateAccount class.
   */
  get transaction(): any {
    throwNewError(
      'Polkadot account creation does not require any on chain transactions. You should always first check the supportsTransactionToCreateAccount property - if false, transaction is not supported/required for this chain type',
    )
    return null
  }

  /** Polkadot does not require the chain to execute a createAccount transaction to create the account structure on-chain */
  get supportsTransactionToCreateAccount(): boolean {
    return false
  }

  /** Compose a transaction to send to the chain to create a new account
   *  Polkadot does not require a create account transaction to be sent to the chain
   */
  async composeTransaction(): Promise<void> {
    notSupported('CreateAccount.composeTransaction')
  }

  /** Determine if desired account name is usable for a new account.
   *  Recycling is not supported on Polkadot.
   */
  async determineNewAccountName(accountName: PolkadotAddress): Promise<any> {
    return { alreadyExists: false, newAccountName: accountName, canRecycle: false }
  }

  /** Returns the Polkadot Address as a Polkadot Account name for the public key provided in options
   *  Or generates a new mnemonic(phrase)/private/public/address
   *  Updates generatedKeys for the newly generated name (since name/account is derived from publicKey)
   */
  async generateAccountName(): Promise<any> {
    const accountName = await this.generateAccountNameString()
    return toPolkadotEntityName(accountName)
  }

  /** Returns a string of the Polkadot Address for the public key provide in options - OR generates a new mnemonic(phrase)/private/public/address */
  async generateAccountNameString(): Promise<string> {
    await this.generateKeysIfNeeded()
    return this.accountName as string
  }

  /** Checks create options - if publicKeys are missing,
   *  autogenerate the public and private key pair and add them to options
   */
  async generateKeysIfNeeded() {
    let publicKey: PolkadotPublicKey
    this.assertValidOptionPublicKeys()

    publicKey = this?._options?.publicKey
    if (!publicKey) {
      await this.generateAccountKeys()
    }
    this._accountName = getPolkadotAddressFromPublicKey(this._generatedKeypair.publicKey)
    this._accountType = this._options.newKeysOptions.keyPaitType
  }

  private async generateAccountKeys(): Promise<void> {
    const { newKeysOptions } = this._options
    const { keyPairType, phrase: overridePhrase, derivationPath } = newKeysOptions || {}
    const overrideType = keyPairType || DEFAULT_POLKADOT_KEY_PAIR_TYPE

    // this._generatedKeypair = getKeypairFromPhrase(overridePhrase, overrideType)
    this._generatedKeypair = await generateKeyPair(keyPairType, phrase, derivationPath)
    this._options.publicKey = this._generatedKeypair.publicKey
    this._options.newKeysOptions = {
      phrase: overridePhrase,
      keyPairType: overrideType,
    }
  }

  private assertValidOptionPublicKeys() {
    const { publicKey } = this._options
    if (publicKey && isValidPolkadotPublicKey(publicKey)) {
      throwNewError('Invalid option - provided publicKey isnt valid')
    }
  }
}
