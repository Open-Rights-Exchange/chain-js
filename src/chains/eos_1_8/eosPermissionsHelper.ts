/* eslint-disable no-restricted-syntax */
import {
  EosEntityName,
  EosPermissionStruct,
  EosPublicKey,
  EosActionStruct,
  EosPermissionSimplified,
  EosGenerateMissingKeysParams,
  EosGeneratedPermissionKeys,
} from './models'
import { EosChainState } from './eosChainState'
import { composeAction } from './eosCompose'
import { throwNewError } from '../../errors'
import { generateKeyPairAndEncryptPrivateKeys } from './eosCrypto'
import { isNullOrEmpty } from '../../helpers'
import { isEosPermissionStruct, toEosEntityName } from './helpers'
import { ChainActionType } from '../../models'

// OREJS Ported functions
//   addPermission() {} // addPermission
//   addPermissionAndLinkActions() {} // addPermission (with links options)
//   deletePermissions() {} // deletePermissions
//   linkActionsToPermission() {} // linkActionsToPermission
//   unlinkActionsToPermission() {} // unlinkActionsToPermission
//   replaceAccountPublicKeys() {} // exportAccount, reuseAccount

export type LinkPermissionsParams = {
  permissionName: EosEntityName
  contract: EosEntityName
  action: string
}

export type DeletePermissionsParams = {
  accountName: EosEntityName
  permissionName: EosEntityName
}

export type ReplacePermissionKeysParams = {
  permissionName: EosEntityName
  parentPermissionName: EosEntityName
  publicKeys: EosPublicKey[]
  accountPermissions: EosPermissionSimplified[]
  accountName: EosEntityName
}

export type UnlinkPermissionsParams = {
  permissionName: EosEntityName
  contract: EosEntityName
  action: string
}

export class PermissionsHelper {
  private _chainState: EosChainState

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

  /** Compose a collection of actions to add the requested permissions */
  composeAddPermissionActions(
    authAccount: EosEntityName,
    authPermission: EosEntityName,
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

    const newPermissions: EosPermissionStruct[] = []
    // collect an array of new permission objects
    usePermissionsToAdd.forEach(p => {
      const permissionToAdd = this.composePermission(
        [p.publicKey],
        toEosEntityName(p.name),
        toEosEntityName(p.parent),
        p.threshold,
        p.publicKeyWeight,
      )
      newPermissions.push(permissionToAdd)
    })
    // compose updateAuth actions
    // Todo: Sort newPermissions by dependencies in case one permission to add requires another one in the list as its parent
    newPermissions.forEach(permissionToAdd => {
      const updateAuthParams = {
        auth: permissionToAdd.required_auth,
        authAccount,
        authPermission,
        parent: permissionToAdd.parent,
        permission: permissionToAdd.perm_name,
      }
      const updateAuthAction = composeAction(ChainActionType.AccountUpdateAuth, updateAuthParams)
      updateAuthActions.push(updateAuthAction)
    })

    return updateAuthActions
  }

  composeDeletePermissionActions = (
    authAccount: EosEntityName,
    authPermission: EosEntityName,
    permissionsToDelete: DeletePermissionsParams[] = [],
  ): EosActionStruct[] => {
    const delteAuthActions: EosActionStruct[] = []

    permissionsToDelete.forEach(auth => {
      const deleteAuthParams = {
        authAccount,
        authPermission,
        account: auth.accountName,
        permission: auth.permissionName,
      }
      const deleteAuthAction = composeAction(ChainActionType.AccountDeleteAuth, deleteAuthParams)
      delteAuthActions.push(deleteAuthAction)
    })

    return delteAuthActions
  }

  /** Compose an action to replace public keys on an existing account permission */
  composeReplacePermissionKeysAction = async (
    authAccount: EosEntityName,
    authPermission: EosEntityName,
    params: ReplacePermissionKeysParams,
  ): Promise<EosActionStruct> => {
    const { permissionName, parentPermissionName, publicKeys, accountName, accountPermissions } = params
    const permission = accountPermissions.find(p => p.name === permissionName)
    if (!permission)
      throwNewError(
        `composeReplacePermissionKeysAction: Specified account ${accountName} doesn't have a permission name ${permissionName}`,
      )
    // TODO: Unlink all permissions under the permission being replaced
    // ... otherwise RAM will be orphaned on-chain for those permisisons linked to actions
    const permissionToUpdate = this.composePermission(
      publicKeys,
      toEosEntityName(permissionName),
      toEosEntityName(parentPermissionName),
    )

    // compose the updateAuth action
    const updateAuthParams = {
      auth: permissionToUpdate.required_auth,
      authAccount: accountName,
      authPermission: 'owner',
      parent: permissionToUpdate.parent,
      permission: permissionToUpdate.perm_name,
    }
    const updateAuthAction = composeAction(ChainActionType.AccountUpdateAuth, updateAuthParams)
    return updateAuthAction
  }

  /** Compose a collection of actions to link actions to permissions */
  composeLinkPermissionActions = (
    authAccount: EosEntityName,
    authPermission: EosEntityName,
    permissionsToLink: LinkPermissionsParams[] = [],
  ): EosActionStruct[] => {
    const linkAuthActions: EosActionStruct[] = []

    permissionsToLink.forEach(link => {
      const linkAuthParams = {
        authAccount,
        authPermission,
        contract: link.contract,
        action: link.action,
        permission: link.permissionName,
      }
      const linkAuthAction = composeAction(ChainActionType.AccountLinkAuth, linkAuthParams)
      linkAuthActions.push(linkAuthAction)
    })

    return linkAuthActions
  }

  /** Compose a collection of actions to unlink actions to permissions */
  composeUnlinkPermissionActions = (
    authAccount: EosEntityName,
    authPermission: EosEntityName,
    permissionsToUnlink: UnlinkPermissionsParams[] = [],
  ): EosActionStruct[] => {
    const unlinkAuthActions: EosActionStruct[] = []
    permissionsToUnlink.forEach(link => {
      const unlinkAuthParams = {
        action: link.action,
        authAccount,
        authPermission,
        contract: link.contract,
      }
      const unlinkAuthAction = composeAction(ChainActionType.AccountUnlinkAuth, unlinkAuthParams)
      unlinkAuthActions.push(unlinkAuthAction)
    })

    return unlinkAuthActions
  }

  // TODO: Optimize this algorithm

  /** Iterates over the permissions array.
   * Maps permissions by name, and populates its children
   * Returns the deepest permission in the tree, starting from the root permission node */
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

  /** generate a keypair for any new permissions missing a public key */
  static generateMissingKeysForPermissionsToAdd = async (
    permissionsToAdd: Partial<EosPermissionSimplified>[],
    params: EosGenerateMissingKeysParams,
  ) => {
    const generatedKeys: EosGeneratedPermissionKeys[] = []
    const { newKeysPassword, newKeysSalt } = params || {}

    if (isNullOrEmpty(permissionsToAdd)) {
      return null
    }

    // add public kets to existing permissionsToAdd parameter
    const keysToFix = permissionsToAdd.map(async p => {
      if (!p.publicKey) {
        const updatedPerm = p
        const keys = await generateKeyPairAndEncryptPrivateKeys(newKeysPassword, newKeysSalt)
        updatedPerm.publicKey = keys.public
        updatedPerm.publicKeyWeight = 1
        generatedKeys.push({ permissionName: updatedPerm.name, keyPair: keys })
      }
    })
    await Promise.all(keysToFix)
    return { generatedKeys, permissionsToAdd }
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
