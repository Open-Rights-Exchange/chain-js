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
import {
  PermissionsHelper,
  DeletePermissionsParams,
  LinkPermissionsParams,
  UnlinkPermissionsParams,
} from './eosPermissionsHelper'
import { isNullOrEmpty } from '../../helpers'

// OREJS Ported functions
//   hasPermission() {} // checkIfAccountHasPermission

export class EosAccount implements Account {
  private _account: EosAccountStruct

  private _chainState: EosChainState

  private _generatedKeys: Partial<GeneratedKeys>

  private _permHelper: PermissionsHelper

  constructor(chainState: EosChainState) {
    this._chainState = chainState
    this._permHelper = new PermissionsHelper(this._chainState)
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

  /** Both new password and salt must be provided if any permissions are missing public keys */
  private assertValidOptionNewKeys = (
    permissionsToAdd: Partial<EosPermissionSimplified>[],
    generateMissingKeysParams?: GenerateMissingKeysParams,
  ) => {
    const isAnyPublicKeyMissing = permissionsToAdd.some(p => isNullOrEmpty(p.publicKey))
    const { newKeysPassword, newKeysSalt } = generateMissingKeysParams || {}
    if (isAnyPublicKeyMissing && (isNullOrEmpty(newKeysPassword) || isNullOrEmpty(newKeysSalt))) {
      throwNewError('Invalid Option - You must provide either public keys or a password AND salt to generate new keys')
    }
  }

  /** Compose a collection of actions to add the requested permissions
   *  Optionally generates keys if needed (required generateMissingKeysParams)
   *  Returns an array of updateAuth actions as well as any newly generated keys */
  async composeAddPermissionsActions(
    authPermission: EosEntityName,
    permissionsToUpdate: Partial<EosPermissionSimplified>[],
    generateMissingKeysParams?: GenerateMissingKeysParams,
  ): Promise<{ generatedKeys: GeneratedPermissionKeys[]; actions: EosActionStruct[] }> {
    // Add permissions to current account structure
    this.assertValidOptionNewKeys(permissionsToUpdate, generateMissingKeysParams)
    // filter out permissions already on this account
    const filteredPermissions = permissionsToUpdate.filter(
      pu => !this.permissions.some(p => p.name === pu.name && p.parent === pu.parent && p.publicKey === pu.publicKey),
    )
    // generate new keys for each new permission if needed
    const { generatedKeys, permissionsToAdd: usePermissionsToAdd } =
      (await PermissionsHelper.generateMissingKeysForPermissionsToAdd(
        filteredPermissions,
        generateMissingKeysParams,
      )) || {}
    const actions = this._permHelper.composeAddPermissionActions(this.name, authPermission, usePermissionsToAdd)
    return { generatedKeys, actions }
  }

  /** Compose a collection of actions to delete the specified permissions
   *  Returns an array of deleteAuth actions */
  async composeDeletePermissionsActions(
    authPermission: EosEntityName,
    permissionsToUpdate: Partial<DeletePermissionsParams>[],
  ): Promise<EosActionStruct[]> {
    // filter out permissions already not on this account and add this account name
    const deletePermissions = permissionsToUpdate
      .filter(pu => this.permissions.some(p => p.name === pu.permissionName))
      .map(p => ({ accountName: this.name, permissionName: p.permissionName }))
    const actions = this._permHelper.composeDeletePermissionActions(this.name, authPermission, deletePermissions)
    return actions
  }

  /** Compose a collection of actions to link permissions to contract actions
   *  Returns an array of linkAuth actions */
  async composeLinkPermissionsActions(
    authPermission: EosEntityName,
    permissionsToUpdate: LinkPermissionsParams[],
  ): Promise<EosActionStruct[]> {
    const actions = this._permHelper.composeLinkPermissionActions(this.name, authPermission, permissionsToUpdate)
    return actions
  }

  /** Compose a collection of actions to unlink permissions to contract actions
   *  Returns an array of unlinkAuth actions */
  async composeUnlinkPermissionsActions(
    authPermission: EosEntityName,
    permissionsToUpdate: UnlinkPermissionsParams[],
  ): Promise<EosActionStruct[]> {
    const actions = this._permHelper.composeUnlinkPermissionActions(this.name, authPermission, permissionsToUpdate)
    return actions
  }
}
