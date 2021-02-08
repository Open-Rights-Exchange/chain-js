import { Keyring } from '@polkadot/api'
import { PolkadotCreateAccountOptions } from './models/accountModels'
import { PolkadotChainState } from './polkadotChainState'
import { generateNewAccountPhrase } from './polkadotCrypto'
import { isValidPolkadotPublicKey, toPolkadotEntityName } from './helpers'
import { isNullOrEmpty, notSupported } from '../../helpers'
import { CreateAccount } from '../../interfaces'
import { throwNewError } from '../../errors'
import { 
  PolkadotAddress, 
  PolkadotPublicKey, 
  PolkadotKeypairType, 
  PolkadotKeyringPair
} from './models'

export class PolkadotCreateAccount implements CreateAccount {
  private _accountName: string

  private _accountType: PolkadotKeypairType

  private _chainState: PolkadotChainState

  private _options: PolkadotCreateAccountOptions

  private _generatedKeyringPair: PolkadotKeyringPair

  constructor(chainState: PolkadotChainState, options?: PolkadotCreateAccountOptions) {
    this._chainState = chainState
    this._options = options
  }
  
  public get accountName(): any {
    return this._accountName
  }
  
  public get accountType(): PolkadotKeypairType {
    return this._accountType
  }
  
  public getSS58Format(): number {
    return this._chainState.chainInfo.nativeInfo.SS58
  }

  get didRecycleAccount() {
    return false
  }

  get generatedKeys() {
    if (this._generatedKeyringPair) {
      return this._generatedKeyringPair
    }
    return null
  }

  get options() {
    return this._options
  }

  get transaction(): any {
    throwNewError(
      'Polkadot account creation does not require any on chain transactions. You should always first check the supportsTransactionToCreateAccount property - if false, transaction is not supported/required for this chain type',
    )
    return null
  }

  get supportsTransactionToCreateAccount(): boolean {
    return false
  }

  async composeTransaction(): Promise<void> {
    notSupported('CreateAccount.composeTransaction')
  }

  async determineNewAccountName(accountName: PolkadotAddress): Promise<any> {
    return { alreadyExists: false, newAccountName: accountName, canRecycle: false }
  }

  async generateAccountName(): Promise<any> {
    const accountName = await this.generateAccountNameString()
    return toPolkadotEntityName(accountName)
  }

  async generateAccountNameString(): Promise<string> {
    await this.generateKeysIfNeeded()
    return this.accountName as string
  }

  async generateKeysIfNeeded() {
    let publicKey: PolkadotPublicKey
    this.assertValidOptionPublicKeys()
    this.assertValidOptionNewKeys()

    publicKey = this?._options?.publicKey
    if (!publicKey) {
      await this.generateAccountKeys()
    }
    this._accountName = this._generatedKeyringPair.address
    this._accountType = this._generatedKeyringPair.type as PolkadotKeypairType
  }

  private async generateAccountKeys() {
    const { newKeysOptions } = this._options
    const { derivationPath } = newKeysOptions || {}
    const overrideType = 'ed25519'
    const overridePhrase = generateNewAccountPhrase()
    const keyring = new Keyring({ ss58Format: this.getSS58Format(), type: overrideType })
    const suri = derivationPath ? overridePhrase + '//' + derivationPath : overridePhrase

    const generatedKeyPair = keyring.createFromUri(`${suri}`)
    this._generatedKeyringPair = generatedKeyPair
    this._options.publicKey = this._generatedKeyringPair.publicKey as PolkadotPublicKey
    this._options.newKeysOptions.phrase = overridePhrase
    this._options.newKeysOptions.type = overrideType
  }

  private assertValidOptionPublicKeys() {
    const { publicKey } = this._options
    if (publicKey && isValidPolkadotPublicKey(publicKey)) {
      throwNewError('Invalid option - provided publicKey isnt valid')
    }
  }

  private assertValidOptionNewKeys() {
    const { newKeysOptions } = this._options
    const { phrase } = newKeysOptions || {}
    if (isNullOrEmpty(phrase)) {
      throwNewError('Invalid option - you must provide a phrase to generate new keys')
    }
  }
}