import { EosChainState } from './eosChainState'
import {
  EosEntityName,
  EosAccountStruct,
  EosPermissionSimplified,
  EosActionStruct,
  toEosEntityName,
  EosPublicKey,
  GenerateMissingKeysParams,
  GeneratedPermissionKeys,
  GeneratedKeys,
} from './models'
import { Account } from '../../models'
import { throwNewError } from '../../errors'
import { mapChainError } from './eosErrors'
import { PermissionsHelper } from './eosPermissionsHelper'

// OREJS Ported functions
//   hasPermission() {} // checkIfAccountHasPermission

export class EosAccount implements Account {
  private _account: EosAccountStruct

  private _chainState: EosChainState

  private _generatedKeys: Partial<GeneratedKeys>

  constructor(chainState: EosChainState) {
    this._chainState = chainState
  }

  /** Account name */
  get name() {
    return this._account?.account_name
  }

  /** Public Key(s) associated with the account */
  get publicKeys(): EosPublicKey[] {
    this.assertHasAccount()
    return this.permissions.map(p => p.publicKey)
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

  /** Retrieves account from chain */
  async fetchFromChain(accountName: EosEntityName): Promise<void> {
    let account
    try {
      account = await this._chainState.rpc.get_account(accountName)
    } catch (error) {
      const chainError = mapChainError(error)
      chainError.message = `problem fetching account:${accountName} from chain`
      throw chainError
    }

    this._account = account
  }

  /** JSON representation of transaction data */
  toJson() {
    this.assertHasAccount()
    return this._account
  }

  /** Returns the raw value from the chain */
  get value(): EosAccountStruct {
    return this._account
  }

  private assertHasAccount(): void {
    if (!this._account) {
      throwNewError('Account not retrieved from chain')
    }
  }

  // ---------------- EOS SPECIFIC FUNCTIONS ------------------
  // These features are not on the main Account interface
  // They are only accessaible via an EosAccount object

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
   *  Optionally generates keys if needed (required generateMissingKeysParams)
   *  Returns an array of updateAuth actions as well as any newly generated keys  */
  async composeAddPermissionsActions(
    authAccount: EosEntityName,
    authPermission: EosEntityName,
    permissionsToAdd: Partial<EosPermissionSimplified>[],
    generateMissingKeysParams?: GenerateMissingKeysParams,
  ): Promise<{ generatedKeys: GeneratedPermissionKeys[]; actions: EosActionStruct[] }> {
    // Add permissions to current account structure
    const permissionHelper = new PermissionsHelper(this._chainState)
    // filter out permissions already on this account
    const filteredPermissionsToAdd = permissionsToAdd.filter(pa =>
      this.permissions.find(p => !(p.name === pa.name && p.parent === pa.parent)),
    )

    // generate new keys for each new permission if needed
    const { generatedKeys, permissionsToAdd: usePermissionsToAdd } =
      (await PermissionsHelper.generateMissingKeysForPermissionsToAdd(
        filteredPermissionsToAdd,
        generateMissingKeysParams,
      )) || {}

    const actions = permissionHelper.composeAddPermissionsActions(authAccount, authPermission, usePermissionsToAdd)

    return { generatedKeys, actions }
  }
}
