import { EosChainState } from './eosChainState'
import { EosEntityName, EosAccountStruct, EosPermissionSimplified, EosActionStruct, toEosEntityName } from './models'
import { throwNewError } from '../../errors'
import { mapChainError } from './eosErrors'
import { PermissionsHelper } from './eosPermissionsHelper'

// OREJS Ported functions
//   hasPermission() {} // checkIfAccountHasPermission

export class EosAccount {
  private _chainState: EosChainState

  private _account: EosAccountStruct

  constructor(chainState: EosChainState) {
    this._chainState = chainState
  }

  // formally called getAccountPermissions
  async getAccountKeys() {
    this.assertHasAccount()
    const { permissions } = this._account
    return permissions
  }

  // retrieve account from chain
  async fetchFromChain(accountName: EosEntityName) {
    let account
    try {
      account = await this._chainState.rpc.get_account(accountName)
    } catch (error) {
      const chainError = mapChainError(error)
      chainError.message = `problem fetching account:${accountName} from chain`
      throw chainError
    }

    this._account = account
    return account
  }

  get name() {
    return this._account?.account_name
  }

  /** Returns the simplified permission names and keys
   *  only returns the first key for each permission
   *  Hint: if publicKeyWeight != 1, then there might be another key for that permission
   */
  get permissions(): EosPermissionSimplified[] {
    return this._account?.permissions.map(p => ({
      name: p.perm_name,
      parent: p.parent,
      publicKey: p.required_auth.keys[0].key,
      publicKeyWeight: p.required_auth.keys[0].weight,
      threshold: p.required_auth.threshold,
    }))
  }

  /** Return permission details if account has it attached 
      Or null otherwise */
  hasPermission(permissionName: EosEntityName): EosPermissionSimplified {
    return this.permissions.find(p => p.name === permissionName) || null
  }

  /** Compose a collection of actions to add the requested permissions
   *  For each updateAuth action (one per permission), the prior complete auth tree must be provided
   *  ... so we must keep the current auth state following the last added permission */
  async composeAddPermissionsActions(
    payerAccountName: EosEntityName,
    payerAccountPermissionName: EosEntityName,
    permissionsToAdd: EosPermissionSimplified[],
  ): Promise<EosActionStruct[]> {
    // Add permissions to current account structure
    const permissionHelper = new PermissionsHelper(this._chainState)
    const updateAuthActions = await permissionHelper.composeAddPermissionsActions(
      payerAccountName,
      payerAccountPermissionName,
      permissionsToAdd,
    )
    return updateAuthActions
  }

  /** Tries to retrieve the account from the chain
   *  Returns { exists:true|false, account } */
  async doesAccountExist(accountName: string): Promise<{ exists: boolean; account: EosAccount }> {
    try {
      await this.fetchFromChain(toEosEntityName(accountName))
      // let account = await this.rpc.get_account(accountName);
      return { exists: true, account: this }
    } catch (e) {
      return { exists: false, account: null }
    }
  }

  /** Returns the raw value from the chain */
  get value() {
    return this._account
  }

  toJson() {
    this.assertHasAccount()
    return this._account
  }

  private assertHasAccount(): void {
    if (!this._account) {
      throwNewError('Account not retrieved from chain')
    }
  }
}
