/* eslint-disable @typescript-eslint/no-unused-vars */
import { notSupported, notImplemented } from '../../helpers'
import { Account } from '../../interfaces'
import { throwNewError } from '../../errors'
import { AlgorandAccountStruct, AlgorandAddress, AlgorandPublicKey } from './models'
import { AlgorandChainState } from './algoChainState'
import { calculateAddressFromPublicKey } from './algoCrypto'
import { isValidAlgorandAddress, isValidAlgorandPublicKey } from './helpers'

export class AlgorandAccount implements Account {
  private _account: AlgorandAccountStruct

  private _publicKey: AlgorandPublicKey

  private _chainState: AlgorandChainState

  constructor(chainState: AlgorandChainState) {
    this._chainState = chainState
  }

  /** Whether the account is currently unused and can be reused - possible in Algorand due to the "rekeying" feature */
  get canBeRecycled(): boolean {
    return notImplemented()
  }

  /** Algorand address */
  get name(): any {
    this.assertHasAccount()
    return this._account?.address
  }

  /** Public Key(s) associated with the account */
  get publicKeys(): any {
    this.assertHasAccount()
    return this._publicKey
  }

  /** Whether the account name can be used for new account */
  isValidNewAccountName = async (accountName: string | AlgorandAddress): Promise<boolean> => {
    return isValidAlgorandAddress(accountName)
  }

  /** Sets the Algorand address */
  load = async (address?: AlgorandAddress): Promise<void> => {
    this.assertValidAlgorandAddress(address)
    try {
      this._account = await this._chainState.algoClient.accountInformation(address)
    } catch (error) {
      // ALGO TODO: map chain error
      throw new Error()
    }
  }

  /** Sets the algorand public key and account */
  setPublicKey = async (publicKey: AlgorandPublicKey) => {
    this.assertValidAlgorandPublickey(publicKey)
    this._publicKey = publicKey
    const address = calculateAddressFromPublicKey(publicKey)
    this._account = await this._chainState.algoClient.accountInformation(address)
  }

  /** An algorand account is registered/active on the chain if the account has a minimum balance of  100,000 microalgos */
  get supportsOnChainAccountRegistry(): boolean {
    return true
  }

  /** In future once the algorand rekeying feature is released, accounts would be recycled by changing the spending key on the account */
  get supportsRecycling(): boolean {
    return false
  }

  /** JSON representation of address */
  toJson() {
    this.assertHasAccount()
    return this._account
  }

  /** Returns the address */
  get value(): AlgorandAccountStruct {
    this.assertHasAccount()
    return this._account
  }

  private assertHasAccount(): void {
    if (!this._account) {
      throwNewError('Account not retrieved from chain')
    }
  }

  private assertValidAlgorandAddress(address: AlgorandAddress): void {
    if (!isValidAlgorandAddress(address)) {
      throwNewError('Not a valid algorand address')
    }
  }

  private assertValidAlgorandPublickey(publicKey: AlgorandPublicKey): void {
    if (!isValidAlgorandPublicKey(publicKey)) {
      throwNewError('Not a valid algorand public key')
    }
  }
}
