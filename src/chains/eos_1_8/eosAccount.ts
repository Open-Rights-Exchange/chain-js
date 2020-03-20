import { EosChainState } from './eosChainState'
import {
  EosEntityName,
  EosAccountStruct,
  EosPermissionSimplified,
  EosActionStruct,
  EosPublicKey,
  EosNewKeysOptions,
  EosGeneratedPermissionKeys,
  EosGeneratedKeys,
  LinkPermissionsParams,
  DeletePermissionsParams,
  UnlinkPermissionsParams,
  EosPermission,
} from './models'
import { Account } from '../../interfaces'
import { throwNewError } from '../../errors'
import { mapChainError } from './eosErrors'
import { isNullOrEmpty } from '../../helpers'
import { toEosEntityName } from './helpers'
import { PermissionsHelper } from './eosPermissionsHelper'
import { ChainErrorType } from '../../models'

// OREJS Ported functions
//   hasPermission() {} // checkIfAccountHasPermission

export class EosAccount implements Account {
  private _account: EosAccountStruct

  private _chainState: EosChainState

  private _generatedKeys: Partial<EosGeneratedKeys>

  private _permHelper: PermissionsHelper

  constructor(chainState: EosChainState) {
    this._chainState = chainState
    this._permHelper = new PermissionsHelper(this._chainState)
  }

  /** EOS accounts can be recycled by replacing the account keys */
  supportsRecycling = (): boolean => {
    return true
  }

  /** Whether the account is currently unused and can be reused
   *  Checks that existing account's active public key matches a designated unusedAccountPublicKey value */
  get canBeRecycled(): boolean {
    const unusedAccountPublicKey = this._chainState?.chainSettings?.unusedAccountPublicKey
    this.assertHasAccount()
    // check that the public active key matches the unused public key marker
    const { firstPublicKey } = this.permissions.find(perm => perm.name === toEosEntityName('active'))
    return firstPublicKey === unusedAccountPublicKey
  }

  /** Account name */
  get name() {
    return this._account?.account_name
  }

  /** Public Key(s) associated with the account */
  get publicKeys(): EosPublicKey[] {
    this.assertHasAccount()
    // unique set of public keys across all permissions
    const allPublicKeys = new Set<EosPublicKey>()
    this.permissions?.forEach(p => p.requiredAuth.keys.forEach(k => allPublicKeys.add(k.key)))
    return [...allPublicKeys]
  }

  /** Whether the account is already in use on chain */
  async isValidNewAccountName(accountName: string): Promise<boolean> {
    const accountExists = await this.doesAccountExist(accountName)
    return !accountExists
  }

  /** Tries to retrieve the account from the chain
   *  Returns whether the account exists on the chain  */
  async doesAccountExist(accountName: string): Promise<boolean> {
    try {
      await this.load(toEosEntityName(accountName))
      return true
    } catch (e) {
      return false
    }
  }

  /** Retrieves account from chain */
  async load(accountName: EosEntityName): Promise<void> {
    let account
    try {
      account = await this._chainState.rpc.get_account(accountName)
    } catch (error) {
      const chainError = mapChainError(error)
      // if account doesn't exist on the chain - remap the chain error (db key error)
      if (chainError.errorType === ChainErrorType.DataReadFailedKeyDoesNotExist) {
        chainError.errorType = ChainErrorType.AccountDoesntExist
      }
      chainError.message = `problem fetching account:${accountName} from chain: ${chainError.message}`
      throw chainError
    }

    this._account = account
  }

  /** eos accounts exist on the chain  */
  supportsOnChainAccountRegistry = (): boolean => {
    return true
  }

  /** JSON representation of transaction data */
  toJson() {
    this.assertHasAccount()
    return this._account
  }

  /** Returns the raw value from the chain */
  get value(): EosAccountStruct {
    this.assertHasAccount()
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
  get permissions(): EosPermission[] {
    return this._account?.permissions.map(p => PermissionsHelper.mapPermissionStructToEosPermission(p))
  }

  /** Return permission details if account has it attached 
      Or null otherwise */
  hasPermission(permissionName: EosEntityName): EosPermission {
    return this.permissions?.find(p => p.name === permissionName) || null
  }

  /** Compose a collection of actions to add the requested permissions
   *  Optionally generates keys if needed (required generateMissingKeysParams)
   *  Returns an array of updateAuth actions as well as any newly generated keys */
  async composeAddPermissionsActions(
    authPermission: EosEntityName,
    permissionsToUpdate: Partial<EosPermissionSimplified>[],
    newKeysOptions?: EosNewKeysOptions,
    /** don't return an action for a permission that is already on the account with the same parent and publicKey */
    skipExistingPermissions: boolean = true,
    appendKeyToExistingPermission: boolean = false,
  ): Promise<{ generatedKeys: EosGeneratedPermissionKeys[]; actions: EosActionStruct[] }> {
    let usePermissionsToUpdate = permissionsToUpdate
    // Add permissions to current account structure
    this.assertValidOptionNewKeys(permissionsToUpdate, newKeysOptions)
    // filter out permissions already on this account
    if (skipExistingPermissions) {
      usePermissionsToUpdate = permissionsToUpdate.filter(
        pu =>
          !this.permissions.some(
            p => p.name === pu.name && p.parent === pu.parent && p.requiredAuth.keys.some(k => k.key === pu.publicKey),
          ),
      )
    }
    // generate new keys for each new permission if needed
    const { generatedKeys, permissionsToAdd: usePermissionsToAdd } =
      (await PermissionsHelper.generateMissingKeysForPermissionsToAdd(usePermissionsToUpdate, newKeysOptions)) || {}
    const actions = this._permHelper.composeAddPermissionActions(
      this.name,
      authPermission,
      usePermissionsToAdd,
      appendKeyToExistingPermission,
    )
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

  /** Both new password and salt must be provided if any permissions are missing public keys */
  private assertValidOptionNewKeys = (
    permissionsToAdd: Partial<EosPermissionSimplified>[],
    newKeysOptions?: EosNewKeysOptions,
  ) => {
    const isAnyPublicKeyMissing = permissionsToAdd.some(p => isNullOrEmpty(p.publicKey))
    const { password, salt } = newKeysOptions || {}
    if (isAnyPublicKeyMissing && (isNullOrEmpty(password) || isNullOrEmpty(salt))) {
      throwNewError('Invalid Option - You must provide either public keys or a password AND salt to generate new keys')
    }
  }
}
