import { EosChainState } from './eosChainState'
import {
  EosAccountStruct,
  EosActionStruct,
  EosEntityName,
  EosPermissionStruct,
  EosPermissionSimplified,
  EosPublicKey,
  toEosEntityName,
  toEosPublicKey,
  toEosPrivateKey,
  GeneratedKeys,
  GenerateMissingKeysParams,
  GeneratedPermissionKeys,
} from './models'
import { EosAccount } from './eosAccount'
import { throwNewError } from '../../errors'
import { CreateAccount, AccountType } from '../../models'
import { EosTransaction, PublicKeyMapCache } from './eosTransaction'
import { timestampEosBase32, randomEosBase32 } from './helpers'
import {
  ACCOUNT_NAME_MAX_LENGTH,
  DEFAULT_ACCOUNT_NAME_PREFIX,
  DEFAULT_CREATEESCROW_APPNAME,
  DEFAULT_CREATEESCROW_CONTRACT,
  DEFAULT_ORE_ACCOUNT_PRICEKEY,
} from './eosConstants'
import { generateNewAccountKeysAndEncryptPrivateKeys } from './eosCrypto'
import { addUniqueToArray, isNullOrEmpty } from '../../helpers'
import { composeAction, ChainActionType } from './eosCompose'
import { PermissionsHelper } from './eosPermissionsHelper'
import { EncryptedDataString, decrypt } from '../../crypto'

// OREJS Ported functions
//   createAccount() {} // createOreAccount
//   createAccountcreateEscrow() {} // createEscrowAccount
//   createAccountNested() {} // createKeyPair
// Obsolete - no longer needed:
//   checkIfAccountNameUsable() {} // checkIfAccountNameUsable

export type CreateAccountOptions = {
  accountNamePrefix?: string // Default 'ore'
  // newAccountName: EosEntityName,      // Optional - aka oreAccountName
  payerAccountName: EosEntityName
  payerAccountPermissionName: EosEntityName // Default = 'active' aka permission
  recycleExistingAccount?: boolean // aka reuseAccount
  /** to generate new keys (using newKeysOptions), leave both publicKeys as null */
  publicKeys?: {
    owner?: EosPublicKey
    active?: EosPublicKey
  }
  newKeysOptions?: {
    newKeysPassword?: string
    newKeysSalt?: string
  }
  oreOptions?: {
    pricekey?: number // default = 1
    referralAccountName?: EosEntityName // default = ''  // aka referral
  }
  createEscrowOptions?: {
    contractName: EosEntityName // default = 'createescrow'
    appName: string // aka 'origin' field
  }
  createVirtualNestedOptions?: {
    parentAccountName: EosEntityName
    rootPermission?: EosEntityName
  }
  // firstAuthorizer?: {               // move first authorizer to higher-level function
  //   accountName: EosEntityName,
  //   permissionName: EosEntityName,
  //   Action?: EosActionStruct,
  // },
  /** to generate a new key (using newKeysOptions), leave both publicKeys as null */
  permissionsToAdd?: Partial<EosPermissionSimplified>[]
  permissionsToLink?: {
    permissionName: EosEntityName
    contract: EosEntityName
    action: string
  }[]
}

/** Helper class to compose a transction for creating a new chain account
 *  Handles native, virtual, and createEscrow accounts
 *  Generates new account keys if not provide
 *  Supports reusing a recycled account and a wide range of other options */
export class EosCreateAccount implements CreateAccount {
  private _accountName: EosEntityName

  private _chainState: EosChainState

  private _account: EosAccountStruct

  private _transaction: EosTransaction

  private _accountType: AccountType

  private _options: CreateAccountOptions

  private _generatedKeys: Partial<GeneratedKeys>

  constructor(chainState: EosChainState) {
    this._chainState = chainState
  }

  /** Compose a transaction to send to the chain to create a new account */
  async composeTransaction(
    accountType: AccountType,
    accountName?: EosEntityName | null,
    options?: CreateAccountOptions,
  ): Promise<void> {
    this._accountType = accountType
    this._options = this.applyDefaultOptions(options)
    const {
      payerAccountName,
      payerAccountPermissionName,
      permissionsToLink,
      oreOptions: { pricekey, referralAccountName },
      recycleExistingAccount,
      createEscrowOptions: { contractName, appName },
    } = this._options

    // determine account name - generate account name if once wasn't provided
    const permissionHelper = new PermissionsHelper(this._chainState)
    const useAccountName = await this.determineNewAccountName(accountName)
    this._accountName = useAccountName

    // get keys from paramters or freshly generated
    const publicKeys = await this.getPublicKeysFromOptionsOrGenerateNewKeys()

    // compose action - call the composeAction type to generate the right transaction action
    let createAccountAction
    const { active: publicKeyActive, owner: publicKeyOwner } = publicKeys || {}
    const args = {
      accountName: useAccountName,
      contractName,
      appName,
      payerAccountName,
      payerAccountPermissionName,
      pricekey,
      publicKeyActive,
      publicKeyOwner,
      referralAccountName,
    }

    // To recycle an account, we dont create new account, just replace keys on an existing one
    if (recycleExistingAccount) {
      // we've already confirmed (in generateAccountName) that account can be recycled
      const parentAccount = new EosAccount(this._chainState)
      // replacing the keys of an existing account, so fetch it first
      await parentAccount.fetchFromChain(this._accountName)

      const replaceActivePermissionAction = await permissionHelper.composeReplacePermissionKeysAction(
        payerAccountName,
        payerAccountPermissionName,
        {
          permissionName: toEosEntityName('active'),
          parentPermissionName: toEosEntityName('owner'),
          publicKeys: [toEosPublicKey(publicKeys.active)],
          accountPermissions: parentAccount.permissions,
          accountName: this._accountName,
        },
      )
      createAccountAction = replaceActivePermissionAction
    } else {
      switch (accountType) {
        case AccountType.Native:
          throwNewError('AccountType.Native not yet supported') // ToDo: implement this
          break
        case AccountType.NativeOre:
          createAccountAction = composeAction(ChainActionType.OreCreateAccount, args)
          break
        case AccountType.CreateEscrow:
          createAccountAction = composeAction(ChainActionType.CreateEscrowCreate, args)
          break
        case AccountType.VirtualNested:
          // For a virual 'nested' account, we don't have a create account action
          // instead, we will need to add permissions (below) to the parent account
          createAccountAction = null
          break
        default:
          break
      }
    }

    // add permissions - add permissions actions to the transaction if needed
    const updatePermissionsActions = await this.composeAddPermissionsActions()
    // add permissions - link permissions actions to the transaction if needed
    const linkPermissionsActions = permissionHelper.composeLinkPermissionActions(
      payerAccountName,
      payerAccountPermissionName,
      permissionsToLink,
    )

    // Create a transaction object to execute the updates
    const newTransaction = new EosTransaction(this._chainState)
    // newTransaction.actions = [createAccountAction, updatePermissionsActions, linkPermissionsActions]
    let newActions: EosActionStruct[] = []
    if (!isNullOrEmpty(createAccountAction)) newActions.push(createAccountAction)
    if (!isNullOrEmpty(updatePermissionsActions)) newActions = newActions.concat(updatePermissionsActions)
    if (!isNullOrEmpty(linkPermissionsActions)) newActions = newActions.concat(linkPermissionsActions)
    if (!isNullOrEmpty(newActions)) newTransaction.actions = newActions

    // add new public keys to transaction's key map so it can map the new account/permissions to public keys
    newTransaction.appendPublicKeyCache(this.gatherPublicKeyMapFromGeneratedKeys())
    // generate and validate the serialized tranasaction - ready to send to the chain
    await newTransaction.generateSerialized()
    await newTransaction.validate()
    this.addNewAccountSignaturesIfNeeded(updatePermissionsActions, newTransaction)
    this._transaction = newTransaction
  }

  /** merge default options and incoming options */
  private applyDefaultOptions = (options: CreateAccountOptions): CreateAccountOptions => {
    return {
      accountNamePrefix: DEFAULT_ACCOUNT_NAME_PREFIX,
      payerAccountPermissionName: 'active',
      recycleExistingAccount: false,
      oreOptions: {
        pricekey: DEFAULT_ORE_ACCOUNT_PRICEKEY,
        referralAccountName: null,
      },
      createEscrowOptions: {
        contractName: toEosEntityName(DEFAULT_CREATEESCROW_CONTRACT),
        appName: DEFAULT_CREATEESCROW_APPNAME, // TODO: reconsider whether we should default a value here
      },
      ...options,
    }
  }

  /** If any of the actions atached to the createAccount transaction need the new account's owner or active key signature, add them  */
  private addNewAccountSignaturesIfNeeded(updatePermissionsActions: EosActionStruct[], transaction: EosTransaction) {
    const missingKeys = transaction.missingSignatures || []
    if (!missingKeys) return

    const keyMap = this.gatherPublicKeyMapFromGeneratedKeys()
    missingKeys.forEach(mk => {
      const neededKey = keyMap
        .filter(k => k.permissionName === toEosEntityName('owner') || k.permissionName === toEosEntityName('active'))
        .find(k => k.publicKey === mk.publicKey)
      if (neededKey) {
        let privateKeyEncrypted
        const { active, owner } = this._generatedKeys.accountKeys.privateKeys // mk.permissionName is only 'owner' or 'active' here
        if (neededKey.permissionName === toEosEntityName('owner')) privateKeyEncrypted = owner
        if (neededKey.permissionName === toEosEntityName('active')) privateKeyEncrypted = active
        const decrypted = this.decryptGeneratedPrivateKey(privateKeyEncrypted as EncryptedDataString)
        transaction.sign([decrypted])
      }
    })
  }

  /** decrypt one of the newly generated private keys using the password and salt generated with */
  private decryptGeneratedPrivateKey(privateKeyEncrypted: EncryptedDataString) {
    const { newKeysOptions } = this._options
    const { newKeysPassword, newKeysSalt } = newKeysOptions || {}
    const decrypted = decrypt(privateKeyEncrypted, newKeysPassword, newKeysSalt)
    return toEosPrivateKey(decrypted)
  }

  /** Gather the collection of new permission and their public keys
   *  this is needed for the transaction object to check required signatures */
  private gatherPublicKeyMapFromGeneratedKeys(): PublicKeyMapCache[] {
    const accountName = toEosEntityName(this._accountName)
    const mappedKeys: PublicKeyMapCache[] = [
      {
        accountName,
        permissionName: toEosEntityName('owner'),
        publicKey: toEosPublicKey(this.generatedKeys.accountKeys.publicKeys.owner),
      },
      {
        accountName,
        permissionName: toEosEntityName('active'),
        publicKey: toEosPublicKey(this.generatedKeys.accountKeys.publicKeys.active),
      },
    ]
    const permissionKeys = (this.generatedKeys.permissionKeys || []).map(
      (p: { permissionName: any; keyPair: { public: any } }) => ({
        accountName,
        permissionName: p.permissionName,
        publicKey: p.keyPair.public,
      }),
    )
    return addUniqueToArray(mappedKeys, permissionKeys) // pooky
  }

  /** A new account will start with a permission array with owner and active keys */
  private composeNewAccountPermissionStructure(): EosPermissionStruct[] {
    const { publicKeys } = this._options
    const { active, owner } = publicKeys || {}
    const permissionHelper = new PermissionsHelper(this._chainState)
    const ownerPermission = permissionHelper.composePermission([owner], toEosEntityName('owner'), null)
    const activePermission = permissionHelper.composePermission(
      [active],
      toEosEntityName('active'),
      toEosEntityName('owner'),
    )
    return [ownerPermission, activePermission]
  }

  /** For a virual nested account, we add the new account's permission on the bottom of the linked list of permissions */
  private async composeNewVirualNestedAccountPermissionStructure(): Promise<EosPermissionStruct> {
    const { publicKeys, createVirtualNestedOptions } = this._options
    const { parentAccountName, rootPermission } = createVirtualNestedOptions || {}
    const { active: publicKeyActive } = publicKeys || {}
    const parentAccount = new EosAccount(this._chainState)
    await parentAccount.fetchFromChain(parentAccountName)
    const permissionHelper = new PermissionsHelper(this._chainState)
    const { perm_name: deepestPermissionName } = permissionHelper.findDeepestPermission(
      parentAccount.value.permissions,
      rootPermission,
    )
    // create a new 'nested account' permission using the new account name as the permission name
    // ... and the currently deepest permission name as the parent
    const newVirtualAccountPermission = permissionHelper.composePermission(
      [publicKeyActive],
      this._accountName,
      deepestPermissionName,
    )
    return newVirtualAccountPermission
  }

  /** Compose a collection of actions to add the requested permissions
   *  For each updateAuth action (one per permission), the prior complete auth tree must be provided
   *  ... so we must keep the current auth state following the last added permission */
  private async composeAddPermissionsActions(): Promise<EosActionStruct[]> {
    let newPermission: EosPermissionStruct
    const { createVirtualNestedOptions, payerAccountPermissionName, permissionsToAdd } = this._options
    const { parentAccountName } = createVirtualNestedOptions || {}

    // ----- Virtual Nested account
    if (this._accountType === AccountType.VirtualNested) {
      // add new 'nested' account permission at the bottom of the auth tree
      newPermission = await this.composeNewVirualNestedAccountPermissionStructure()
      const updateAuthParams = {
        auth: newPermission.required_auth,
        authAccountName: parentAccountName,
        authPermission: payerAccountPermissionName,
        parent: newPermission.parent,
        permission: newPermission.perm_name,
      }
      const updateAuthAction = composeAction(ChainActionType.AccountUpdateAuth, updateAuthParams)
      return [updateAuthAction]
    }

    // generate new permission keys if needed
    const { generatedKeys, permissionsToAdd: updatedPermissionsToAdd } =
      (await PermissionsHelper.generateMissingKeysForPermissionsToAdd(
        permissionsToAdd,
        this._options as GenerateMissingKeysParams,
      )) || {}

    this.appendNewGeneratedPermissionKeys(generatedKeys)

    // ----- Native account
    // Add permissions to current account structure
    // NOTE: For a virtual account, we skip this step of adding suplemental permissions
    const permissionHelper = new PermissionsHelper(this._chainState)
    const updateAuthActions = permissionHelper.composeAddPermissionsActions(
      this._accountName,
      payerAccountPermissionName,
      updatedPermissionsToAdd,
    )
    return updateAuthActions
  }

  /** append newly generated keys to class's collection of generated keys */
  appendNewGeneratedPermissionKeys(newGeneratedKeys: GeneratedPermissionKeys[]) {
    const { permissionKeys } = this._generatedKeys
    if (!isNullOrEmpty(permissionKeys)) {
      this._generatedKeys.permissionKeys = [...this._generatedKeys.permissionKeys, ...newGeneratedKeys]
    } else {
      this._generatedKeys.permissionKeys = newGeneratedKeys
    }
  }

  /** Determine if desired account name is usable for a new account.
   *  Generates a new account name if one isnt provided.
   *  If recycleExistingAccount is specified, checks if the name can be reused */
  async determineNewAccountName(accountName: EosEntityName): Promise<EosEntityName> {
    let newAccountName = accountName
    const { accountNamePrefix, recycleExistingAccount } = this._options

    if (!accountName) {
      newAccountName = await this.generateAccountName(accountNamePrefix, true)
    } else {
      const { exists, account } = await this.doesAccountExist(accountName)
      if (exists) {
        if (recycleExistingAccount) {
          // if recylcing an account, a name will be provided and it should be on chain
          this.assertAccountCanBeRecycled(account)
        } else {
          throwNewError('Specified account name already exists on chian.')
        }
      }
    }
    return newAccountName
  }

  /** extract keys from options or generate new keys
   *  Returns publicKeys and generatedKeys if created */
  private async getPublicKeysFromOptionsOrGenerateNewKeys() {
    let generatedKeys: any
    // generate new account owner/active keys if they weren't provided
    let { publicKeys } = this._options
    const { newKeysOptions } = this._options
    const { newKeysPassword, newKeysSalt } = newKeysOptions || {}

    if (publicKeys && (isNullOrEmpty(newKeysPassword) || isNullOrEmpty(!newKeysSalt))) {
      throwNewError(
        'Create Account compose failure - You must provide either public keys or a password AND salt to generate new keys',
      )
    }

    if (!publicKeys) {
      generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(newKeysPassword, newKeysSalt)
      this._generatedKeys = {
        ...this._generatedKeys,
        accountKeys: generatedKeys,
      }
      publicKeys = generatedKeys.publicKeys
      this._options.publicKeys = publicKeys // replace working keys with new ones
    }
    return publicKeys
  }

  /** Generates a random EOS compatible account name and checks chain to see if it is arleady in use.
   *  If already in use, this function is called recursively until a unique name is generated */
  async generateAccountName(prefix: string, checkIfNameUsedOnChain: boolean = true): Promise<EosEntityName> {
    const accountName = this.generateAccountNameString(prefix)
    let exists = false
    if (checkIfNameUsedOnChain) {
      ;({ exists } = await this.doesAccountExist(accountName))
    }
    if (exists) {
      return this.generateAccountName(prefix, checkIfNameUsedOnChain)
    }
    return toEosEntityName(accountName)
  }

  async doesAccountExist(accountName: EosEntityName): Promise<{ exists: boolean; account: EosAccount }> {
    const account = new EosAccount(this._chainState)
    return account.doesAccountExist(accountName)
  }

  /** Generates a random EOS account name
    account names MUST be base32 encoded in compliance with the EOS standard (usually 12 characters)
    account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
    account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars
  */
  generateAccountNameString = (prefix: string = ''): EosEntityName => {
    return toEosEntityName((prefix + timestampEosBase32() + randomEosBase32()).substr(0, ACCOUNT_NAME_MAX_LENGTH))
  }

  /** Checks for existing account and that its active public can matches an unusedAccountPublicKey setting
   *  Throws if account does not meet these conditions */
  private async assertAccountCanBeRecycled(account: EosAccount) {
    if (!account) throw new Error('Account name must be provided is you specify the recycle account option')
    const unusedAccountPublicKey = this._chainState?.chainSettings?.unusedAccountPublicKey
    // check that the public active key matches the unused public key marker
    const { publicKey } = account.permissions.find(perm => perm.name === toEosEntityName('active'))
    if (publicKey === unusedAccountPublicKey) return
    throw new Error(`Account ${account.name} in use and can't be recycled`)
  }

  /** The keys that were generated as part of the account creation process
   *  IMPORTANT: Bes ure to always read and store these keys after creating an account
   *  This is the only way to retrieve the auto-generated private keys after an account is created */
  get generatedKeys() {
    if (this._generatedKeys) {
      return this._generatedKeys
    }
    return null
  }

  get transaction() {
    if (!this._transaction) {
      this._transaction = new EosTransaction(this._chainState)
    }
    return this._transaction
  }
}

// Create account parameters discovered

// ---> ORE account creation paramters
// accountNamePrefix = 'ore'
// payerAccountName
// payerAccountPermissionName // aka permission
// payer
// newAccountName // aka oreAccountName
// publicKeyOwner
// publicKeyActive
// pricekey = 1
// referralAccountName = ''  //aka referral

// ---> createEscrow args
// accountName,
// activekey,
// contractName,  // default = 'createEscrow'
// oreAccountName,
// origin,
// ownerkey,
// permission,
// referral

// ---> ??not sure??
// newAccountDetails : {
//   bytes : number,
//   stakedCpu : number,
//   stakedNet : number
// },
// tokenSymbol
// createOnChainAccount = true
// airdrop = true
// migratingAccountName
// migrating
