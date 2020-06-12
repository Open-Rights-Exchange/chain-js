/* eslint-disable @typescript-eslint/no-unused-vars */
import { notSupported } from '../../helpers'
import { isValidEthereumAddress, isValidEthereumPublicKey } from './helpers'
import { Account } from '../../interfaces'
import { throwNewError } from '../../errors'
import { EthereumChainState } from './ethChainState'
import { EthereumAddress, EthereumPrivateKey, EthereumPublicKey } from './models'
import { getEthereumAddressFromPublicKey } from './ethCrypto'
// OREJS Ported functions
//   hasPermission() {} // checkIfAccountHasPermission

export class EthereumAccount implements Account {
  private _address: EthereumAddress

  private _publicKey: EthereumPublicKey

  private _chainState: EthereumChainState

  constructor(chainState: EthereumChainState) {
    this._chainState = chainState
  }

  /** Whether the account is currently unused and can be reused - not supported in Ethereum */
  get canBeRecycled(): boolean {
    return notSupported()
  }

  /** Ethereum address */
  get name(): any {
    this.assertHasAddress()
    return this._address
  }

  /** Public Key(s) associated with the account */
  get publicKeys(): any {
    this.assertHasAddress()
    return this._publicKey
  }

  /** Whether the account name can be used for new account */
  isValidNewAccountName = async (accountName: string | EthereumAddress): Promise<boolean> => {
    return isValidEthereumAddress(accountName)
  }

  /** Sets the ethereum address
  /* Public key can only be obtained from a transaction signed by an ethereum address
  /* Only Ethereum address is not enough to get public key */
  load = async (address?: EthereumAddress): Promise<void> => {
    this.assertValidEthereumAddress(address)
    this._address = address
  }

  /** Sets the ethereum public key and address */
  setPublicKey = async (publicKey: EthereumPublicKey) => {
    this.assertValidEthereumPublickey(publicKey)
    this._publicKey = publicKey
    this._address = getEthereumAddressFromPublicKey(publicKey)
  }

  /** ETH has no account structure/registry on the chain */
  get supportsOnChainAccountRegistry(): boolean {
    return false
  }

  /** ETH accounts cannot be recycled as the private keys cannot be replaced */
  get supportsRecycling(): boolean {
    return false
  }

  /** JSON representation of address */
  toJson() {
    this.assertHasAddress()
    return { address: this._address }
  }

  /** Returns the address */
  get value(): EthereumAddress {
    return this._address
  }

  private assertHasAddress(): void {
    if (!this._address) {
      throwNewError('Ethereum address or Public key not provided')
    }
  }

  private assertValidEthereumAddress(address: EthereumAddress): void {
    if (!isValidEthereumAddress(address)) {
      throwNewError('Not a valid ethereum address')
    }
  }

  private assertValidEthereumPublickey(publicKey: EthereumPublicKey): void {
    if (!isValidEthereumPublicKey(publicKey)) {
      throwNewError('Not a valid ethereum public key')
    }
  }
}
