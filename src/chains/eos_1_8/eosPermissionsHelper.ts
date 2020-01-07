/* eslint-disable no-restricted-syntax */
import {
  EosAuthorizationStruct,
  EosEntityName,
  EosPermissionStruct,
  EosPublicKey,
  toEosEntityName,
  EosActionStruct,
  EosPermissionSimplified,
  isEosPermissionStruct,
} from './models'
import { EosChainState } from './eosChainState'
import { composeAction, ChainActionType } from './eosCompose'
import { EosAccount } from './eosAccount'
import { throwNewError } from '../../errors'

// OREJS Ported functions
//   addPermission() {} // addPermission
//   addPermissionAndLinkActions() {} // addPermission (with links options)
//   deletePermissions() {} // deletePermissions
//   linkActionsToPermission() {} // linkActionsToPermission
//   unlinkActionsToPermission() {} // unlinkActionsToPermission
//   replaceAccountPublicKeys() {} // exportAccount, reuseAccount

type LinkPermissionsParams = {
  permissionName: EosEntityName
  contract: EosEntityName
  action: string
}[]

type DeletePermissionsParams = {
  accountName: EosEntityName
  permissionName: EosEntityName
}[]

type ReplacePermissionKeysParams = {
  permissionName: EosEntityName
  parentPermissionName: EosEntityName
  publicKeys: EosPublicKey[]
  account?: EosAccount
  accountName?: EosEntityName
}

type UnlinkPermissionsParams = {
  permissionName: EosEntityName
  contract: EosEntityName
  action: string
}[]

export class PermissionsHelper {
  private _chainState: EosChainState

  private _name: EosEntityName

  private _parent: EosEntityName

  private _requiredAuthorizations: EosAuthorizationStruct[]

  constructor(chainState: EosChainState) {
    this._chainState = chainState
  }

  // permissions

  /** return a fully formed EOS permission structure (EosPermissionStruct) */
  composePermission(
    publicKeys: EosPublicKey[],
    permissionName: EosEntityName,
    parentPermissionName: EosEntityName,
    threshold: number = 1,
    weight: number = 1,
  ): EosPermissionStruct {
    const permission: EosPermissionStruct = {
      parent: parentPermissionName,
      perm_name: permissionName,
      required_auth: {
        accounts: [],
        keys: this.weightPermissionKeys(publicKeys, weight),
        threshold,
        waits: [],
      },
    }

    return permission
  }

  weightPermissionKeys = (keys: EosPublicKey[], weight = 1): { key: EosPublicKey; weight: number }[] => {
    return keys.map(key => ({ key, weight }))
  }

  /** Compose a collection of actions to add the requested permissions
   *  For each updateAuth action (one per permission), the prior complete auth tree must be provided
   *  ... so we must keep the current auth state following the last added permission */
  composeAddPermissionsActions(
    payerAccountName: EosEntityName,
    payerAccountPermissionName: EosEntityName,
    permissionsToAdd: Partial<EosPermissionSimplified>[] | EosPermissionStruct[] = [],
  ): EosActionStruct[] {
    const updateAuthActions: EosActionStruct[] = []
    let usePermissionsToAdd = permissionsToAdd

    // convert struct to simplified
    if (isEosPermissionStruct(permissionsToAdd)) {
      usePermissionsToAdd = (permissionsToAdd as EosPermissionStruct[]).map(p => this.permissionsStructToSimplified(p))
    }
    // tell Typescript that permissionsToAdd is now always EosPermissionSimplified[]
    usePermissionsToAdd = permissionsToAdd as EosPermissionSimplified[]

    // loop through each permission to add and create an updateAuth action to add it
    // ... the next permission needs the updatedAuth which includes all permissions added so far to pass in as the most current auth to update in updateauth
    usePermissionsToAdd.forEach(p => {
      const permissionToAdd = this.composePermission(
        [p.publicKey],
        toEosEntityName(p.name),
        toEosEntityName(p.parent),
        p.threshold,
        p.publicKeyWeight,
      )
      // compose the updateAuth action
      const updateAuthParams = {
        auth: permissionToAdd.required_auth,
        authAccountName: payerAccountName,
        authPermission: payerAccountPermissionName,
        parent: permissionToAdd.parent,
        permission: permissionToAdd.perm_name,
      }
      const updateAuthAction = composeAction(ChainActionType.AccountUpdateAuth, updateAuthParams)
      updateAuthActions.push(updateAuthAction)
    })

    return updateAuthActions
  }

  composeDeltePermissionActions = (
    payerAccountName: EosEntityName,
    payerAccountPermissionName: EosEntityName,
    permissionsToDelete: DeletePermissionsParams = [],
  ): EosActionStruct[] => {
    const delteAuthActions: EosActionStruct[] = []

    permissionsToDelete.forEach(auth => {
      const deleteAuthParams = {
        authAccountName: payerAccountName,
        authPermission: payerAccountPermissionName,
        account: auth.accountName,
        permission: auth.permissionName,
      }
      const deleteAuthAction = composeAction(ChainActionType.AccountLinkAuth, deleteAuthParams)
      delteAuthActions.push(deleteAuthAction)
    })

    return delteAuthActions
  }

  /** Compose an action to replace public keys on an existing account permission
      Accepts either an Account object or an account name */
  composeReplacePermissionKeysAction = async (
    payerAccountName: EosEntityName,
    payerAccountPermissionName: EosEntityName,
    params: ReplacePermissionKeysParams,
  ): Promise<EosActionStruct> => {
    const { permissionName, parentPermissionName, publicKeys, accountName } = params
    let { account } = params
    if (!accountName && !account)
      throwNewError('composeReplacePermissionKeysAction: Must provide either an Account object or account name.')
    if (!account) {
      account = new EosAccount(this._chainState)
      await account.fetchFromChain(accountName)
    }
    const permission = account.permissions.find(p => p.name === permissionName)
    if (!permission)
      throwNewError(
        `composeReplacePermissionKeysAction: Specified account ${account.name} doesn't have a permission name ${permissionName}`,
      )
    const permissionToUpdate = this.composePermission(
      publicKeys,
      toEosEntityName(permissionName),
      toEosEntityName(parentPermissionName),
    )

    // compose the updateAuth action
    const updateAuthParams = {
      auth: permissionToUpdate.required_auth,
      authAccountName: accountName,
      authPermission: 'owner',
      parent: permissionToUpdate.parent,
      permission: permissionToUpdate.perm_name,
    }
    const updateAuthAction = composeAction(ChainActionType.AccountUpdateAuth, updateAuthParams)
    return updateAuthAction
  }

  composeLinkPermissionActions = (
    payerAccountName: EosEntityName,
    payerAccountPermissionName: EosEntityName,
    permissionsToLink: LinkPermissionsParams = [],
  ): EosActionStruct[] => {
    const linkAuthActions: EosActionStruct[] = []

    permissionsToLink.forEach(link => {
      const linkAuthParams = {
        authAccountName: payerAccountName,
        authPermission: payerAccountPermissionName,
        contract: link.contract,
        action: link.action,
        permission: link.permissionName,
      }
      const linkAuthAction = composeAction(ChainActionType.AccountLinkAuth, linkAuthParams)
      linkAuthActions.push(linkAuthAction)
    })

    return linkAuthActions
  }

  composeUnlinkPermissionActions = (
    payerAccountName: EosEntityName,
    payerAccountPermissionName: EosEntityName,
    permissionsToUnlink: UnlinkPermissionsParams = [],
  ): EosActionStruct[] => {
    const unlinkAuthActions: EosActionStruct[] = []
    permissionsToUnlink.forEach(link => {
      const unlinkAuthParams = {
        action: link.action,
        authAccountName: payerAccountName,
        authPermission: payerAccountPermissionName,
        contract: link.contract,
      }
      const unlinkAuthAction = composeAction(ChainActionType.AccountUnlinkAuth, unlinkAuthParams)
      unlinkAuthActions.push(unlinkAuthAction)
    })

    return unlinkAuthActions
  }

  // TODO: Optimize this algorithm
  /** Iterates over the permissions array.
  // Maps permissions by name, and populates its children
  // Returns the deepest permission in the tree, starting from the root permission node */

  findDeepestPermission = (permissions: EosPermissionStruct[], rootPermission: EosEntityName): EosPermissionStruct => {
    // First, construct the mapping, from the array...
    const permMap: any[] = [] // Maps the permissions by name (Contructs the tree)
    for (const perm of permissions as any) {
      permMap[perm.perm_name] = perm // Set the permission in the mapping/tree
      perm.children = [] // Set an empty children array, in prep for population in the next iteration
    }
    // Then, fill in the tree, with children...
    for (const perm of permissions as any) {
      const parent = permMap[perm.parent]
      if (parent) {
        parent.children.push(perm)
      }
    }
    // Finally, find the deepest child, with BFS...
    const root = permMap[rootPermission as any]
    let nodesInLevel = [root]
    let deepest = root
    let depth = 0
    while (nodesInLevel.length > 0) {
      let nextLevel: any[] = []
      for (const node of nodesInLevel) {
        node.depth = depth
        deepest = node
        nextLevel = nextLevel.concat(node.children)
      }
      nodesInLevel = nextLevel
      depth += 1
    }
    return deepest as EosPermissionStruct
  }

  /** Converts an EosPermissionStruct to EosPermissionSimplified */
  permissionsStructToSimplified = (permissionStruct: EosPermissionStruct): EosPermissionSimplified => {
    const { parent, perm_name: name, required_auth: requiredAuth } = permissionStruct
    const firstPublicKey: any = requiredAuth.keys[0] || {}
    const { key, weight } = firstPublicKey
    return {
      name,
      parent,
      publicKey: key,
      publicKeyWeight: weight,
      threshold: requiredAuth.threshold,
    }
  }
}
