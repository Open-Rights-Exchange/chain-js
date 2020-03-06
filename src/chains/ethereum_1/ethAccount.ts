/* eslint-disable @typescript-eslint/no-unused-vars */
import { notSupported } from '../../helpers'
import { Account } from '../../interfaces'
import { throwNewError } from '../../errors'
import { EthereumChainState } from './ethChainState'
import { EthereumAccountStruct } from './models/ethStructures'

// OREJS Ported functions
//   hasPermission() {} // checkIfAccountHasPermission

export class EthAccount implements Account {
  private _account: EthereumAccountStruct

  private _chainState: EthereumChainState

  constructor(chainState: EthereumChainState) {
    this._chainState = chainState
  }

  // TODO: all getters are requied to use this. How to restructure the ones which are 'Not Supported'
  /** Whether the account is currently unused and can be reused - not supported in Ethereum */
  get canBeRecycled(): boolean {
    this.assertHasAccount()
    throw new Error('Not supported')
  }

  /** Account name */
  get name(): any {
    this.assertHasAccount()
    return this._account?.address
  }

  /** Public Key(s) associated with the account */
  get publicKeys(): any {
    this.assertHasAccount()
    return this._account.publicKey
  }

  /** Tries to retrieve the account from the chain
   *  Returns { exists:true|false, account } */
  doesAccountExist = async (accountName: string): Promise<{ exists: boolean; account: EthAccount }> => {
    try {
      this.assertHasAccount()
      return { exists: true, account: this }
    } catch {
      return { exists: false, account: null }
    }
  }

  /** Retrieves account from chain */
  fetchFromChain = async (accountName: string): Promise<void> => {
    notSupported()
  }

  /** JSON representation of transaction data */
  toJson() {
    this.assertHasAccount()
    return this._account
  }

  /** Returns the raw value from the chain */
  get value(): any {
    return this._account
  }

  private assertHasAccount(): void {
    if (!this._account) {
      throwNewError('Account not retrieved from chain')
    }
  }
}
