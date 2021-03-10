import { notSupported } from '../../helpers'
import { throwNewError } from '../../errors'
import { Account } from '../../interfaces'
import { PolkadotChainState } from './polkadotChainState'
import { PolkadotAddress, PolkadotPublicKey } from './models'
import { isValidPolkadotAddress, isValidPolkadotPublicKey } from './helpers'

export class PolkadotAccount implements Account {
  private _address: PolkadotAddress

  private _publicKey: PolkadotPublicKey

  private _chainState: PolkadotChainState

  constructor(chainState: PolkadotChainState) {
    this._chainState = chainState
  }

  /** Whether the account is currently unused and can be reused - not supported in Polkadot */
  get canBeRecycled(): boolean {
    return notSupported('PolkadotAccount.canBeRecycled')
  }

  /** Polkadot address */
  get name(): any {
    this.assertHasAddress()
    return this._address
  }

  /** Public Key(s) associated with the account */
  get publicKeys(): any {
    this.assertHasAddress()
    return this._publicKey
  }

  /** Weather the account name can be used for new account */
  isValidNewAccountName = async (accountName: PolkadotAddress): Promise<boolean> => {
    return isValidPolkadotAddress(accountName)
  }

  /** Sets the polkadot address
   * Public key can only be obtained from a transaction signed by an polkadot address
   * Only polkadot address is not enough to get public key
   */
  load = async (address?: PolkadotAddress): Promise<void> => {
    this.assertValidPolkadotAddress(address)
    this._address = address
  }

  /** Sets the polkadot public key and address */
  setPublicKey = async (publicKey: PolkadotPublicKey) => {
    this.assertValidPolkadotPublickey(publicKey)
    this._publicKey = publicKey
    // this._address = getPolkadotAddressFromPublicKey(publicKey)
  }

  /** Polkadot has no account structure/registry on the chain */
  get supportsOnChainAccountRegistry(): boolean {
    return false
  }

  /** Polkadot accounts cannot be recycled as the private keys cannot be replaced */
  get supportsRecycling(): boolean {
    return false
  }

  /** JSON representation of address */
  toJson() {
    this.assertHasAddress()
    return { address: this._address }
  }

  /** Returns the address */
  get value(): PolkadotAddress {
    return this._address
  }

  private assertHasAddress(): void {
    if (!this._address) {
      throwNewError('Polkadot address or Public key not provided')
    }
  }

  private assertValidPolkadotAddress(address: PolkadotAddress): void {
    if (!isValidPolkadotAddress(address)) {
      throwNewError('Not a valid polkadot address')
    }
  }

  private assertValidPolkadotPublickey(publicKey: PolkadotPublicKey): void {
    if (!isValidPolkadotPublicKey(publicKey)) {
      throwNewError('Not a valid polkadot public key')
    }
  }
}
