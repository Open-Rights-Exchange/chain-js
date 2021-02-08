import { notSupported } from '../../helpers'
import { Account } from '../../interfaces'
import { PolkadotAddress, PolkadotPublicKey } from './models'
import { PolkadotChainState } from './polkadotChainState'
import { throwNewError } from '../../errors'
import { isValidPolkadotAddress, isValidPolkadotPublicKey } from './helpers'
import { getPolkadotAddressFromPublicKey } from './polkadotCrypto'

export class PolkadotAccount implements Account {
  private _address: PolkadotAddress

  private _publicKey: PolkadotPublicKey

  private _chainState: PolkadotChainState

  constructor(chainState: PolkadotChainState) {
    this._chainState = chainState
  }
  
  get canBeRecycled(): boolean {
    return notSupported('PolkadotAccount.canBeRecycled')
  }
  
  get name(): any {
    this.assertHasAddress()
    return this._address
  }
  
  get publicKeys(): any {
    this.assertHasAddress()
    return this._publicKey
  }
  
  isValidNewAccountName = async (accountName: PolkadotAddress): Promise<boolean> => {
    return isValidPolkadotAddress(accountName)
  }
  
  load = async (address?: PolkadotAddress): Promise<void> => {
    this.assertValidPolkadotAddress(address)
    this._address = address
  }
  
  setPublicKey = async (publicKey: PolkadotPublicKey) => {
    this.assertValidPolkadotPublickey(publicKey)
    this._publicKey = publicKey
    this._address = getPolkadotAddressFromPublicKey(publicKey)
  }
  
  get supportsOnChainAccountRegistry(): boolean {
    return false
  }
  
  get supportsRecycling(): boolean {
    return false
  }
  
  toJson() {
    this.assertHasAddress()
    return { address: this._address }
  }
  
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