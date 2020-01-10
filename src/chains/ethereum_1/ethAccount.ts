/* eslint-disable @typescript-eslint/no-unused-vars */
import { Account } from '../../interfaces'
import { throwNewError } from '../../errors'
import { EthereumChainState } from './ethChainState'

// OREJS Ported functions
//   hasPermission() {} // checkIfAccountHasPermission

export class EthAccount implements Account {
  private _account: any

  private _chainState: EthereumChainState

  constructor(chainState: EthereumChainState) {
    this._chainState = chainState
  }

  /** Account name */
  get name() {
    return this._account?.account_name
  }

  /** Public Key(s) associated with the account */
  get publicKeys(): any[] {
    this.assertHasAccount()
    throw new Error('Not Implemented')
  }

  /** Tries to retrieve the account from the chain
   *  Returns { exists:true|false, account } */
  doesAccountExist = async (accountName: string): Promise<{ exists: boolean; account: EthAccount }> => {
    throw new Error('Not Implemented')
  }

  /** Retrieves account from chain */
  fetchFromChain = async (accountName: string): Promise<void> => {
    throw new Error('Not Implemented')
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

  // ---------------- Etheruem SPECIFIC FUNCTIONS ------------------
  // These features are not on the main Account interface
  // They are only accessaible via an EosAccount object
  // ...
}
