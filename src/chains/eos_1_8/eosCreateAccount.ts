import { EosChainState } from './eosChainState'
import { CreateAccountOptions, EosActionStruct, EosEntityName, EosPermissionStruct, GeneratedKeys } from './models'
import { EosAccount } from './eosAccount'
import { throwNewError } from '../../errors'
import { AccountType } from '../../models'
import { CreateAccount } from '../../interfaces'
import { EosTransaction } from './eosTransaction'
import { isValidEosPublicKey, timestampEosBase32, randomEosBase32, toEosEntityName, toEosPublicKey } from './helpers'
import {
  ACCOUNT_NAME_MAX_LENGTH,
  DEFAULT_ACCOUNT_NAME_PREFIX,
  DEFAULT_CREATEESCROW_APPNAME,
  DEFAULT_CREATEESCROW_CONTRACT,
  DEFAULT_ORE_ACCOUNT_PRICEKEY,
} from './eosConstants'
import { generateNewAccountKeysAndEncryptPrivateKeys } from './eosCrypto'
import { isNullOrEmpty } from '../../helpers'
import { composeAction, ChainActionType } from './eosCompose'
import { PermissionsHelper } from './eosPermissionsHelper'

// OREJS Ported functions
//   createAccount() {} // createOreAccount
//   createAccountcreateEscrow() {} // createEscrowAccount
//   createAccountNested() {} // createKeyPair
// Obsolete - no longer needed:
//   checkIfAccountNameUsable() {} // checkIfAccountNameUsable

/** Helper class to compose a transction for creating a new chain account
 *  Handles native, virtual, and createEscrow accounts
 *  Generates new account keys if not provide
 *  Supports reusing a recycled account and a wide range of other options */
export class EosCreateAccount implements CreateAccount {
  private _accountName: EosEntityName

  private _chainState: EosChainState

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
      creatorAccountName,
      creatorPermission,
      oreOptions,
      recycleExistingAccount,
      createEscrowOptions,
      resourcesOptions,
    } = this._options
    const { pricekey, referralAccountName } = oreOptions || {}
    const { contractName, appName } = createEscrowOptions || {}
    const { ramBytes, stakeNetQuantity, stakeCpuQuantity, transfer } = resourcesOptions || {}

    this.assertValidOptionPublicKeys()
    this.assertValidOptionNewKeys()

    // determine account name - generate account name if once wasn't provided
    const permissionHelper = new PermissionsHelper(this._chainState)
    const useAccountName = await this.determineNewAccountName(accountName)
    this._accountName = useAccountName

    // get keys from paramters or freshly generated
    const publicKeys = await this.getPublicKeysFromOptionsOrGenerateNewKeys()

    // if recyclying an account, we don't want a generated owner key, we will expect it to be = unusedAccountPublicKey
    if (recycleExistingAccount) {
      publicKeys.owner = null
    }

    // compose action - call the composeAction type to generate the right transaction action
    let createAccountActions
    const { active: publicKeyActive, owner: publicKeyOwner } = publicKeys || {}
    const params = {
      accountName: useAccountName,
      contractName,
      appName,
      creatorAccountName,
      creatorPermission,
      pricekey,
      publicKeyActive,
      publicKeyOwner,
      referralAccountName,
      ramBytes,
      stakeNetQuantity,
      stakeCpuQuantity,
      transfer,
    }

    // To recycle an account, we dont create new account, just replace keys on an existing one
    if (recycleExistingAccount) {
      // we've already confirmed (in generateAccountName) that account can be recycled
      const parentAccount = new EosAccount(this._chainState)
      // replacing the keys of an existing account, so fetch it first
      await parentAccount.fetchFromChain(this._accountName)

      const replaceActivePermissionAction = await permissionHelper.composeReplacePermissionKeysAction(
        creatorAccountName,
        creatorPermission,
        {
          permissionName: toEosEntityName('active'),
          parentPermissionName: toEosEntityName('owner'),
          publicKeys: [toEosPublicKey(publicKeys.active)],
          accountPermissions: parentAccount.permissions,
          accountName: this._accountName,
        },
      )
      createAccountActions = [replaceActivePermissionAction]
    } else {
      switch (accountType) {
        case AccountType.Native:
          createAccountActions = composeAction(ChainActionType.AccountCreate, params)
          break
        case AccountType.NativeOre:
          createAccountActions = [composeAction(ChainActionType.OreCreateAccount, params)]
          break
        case AccountType.CreateEscrow:
          createAccountActions = [composeAction(ChainActionType.CreateEscrowCreate, params)]
          break
        case AccountType.VirtualNested:
          // For a virual 'nested' account, we don't have a create account action
          // instead, we will need to add permissions (below) to the parent account
          createAccountActions = [await this.composeCreateVirtualNestedAction()]
          break
        default:
          break
      }
    }

    // Create a transaction object to execute the updates
    const newTransaction = new EosTransaction(this._chainState)
    // newTransaction.actions = [createAccountAction, updatePermissionsActions, linkPermissionsActions]
    let newActions: EosActionStruct[] = []
    if (!isNullOrEmpty(createAccountActions)) newActions = [...newActions, ...createAccountActions]
    if (!isNullOrEmpty(newActions)) newTransaction.actions = newActions

    // generate and validate the serialized tranasaction - ready to send to the chain
    await newTransaction.generateSerialized()
    await newTransaction.validate()
    this._transaction = newTransaction
  }

  /** merge default options and incoming options */
  private applyDefaultOptions = (options: CreateAccountOptions): CreateAccountOptions => {
    return {
      accountNamePrefix: DEFAULT_ACCOUNT_NAME_PREFIX,
      creatorPermission: 'active',
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
          await this.assertAccountCanBeRecycled(account)
        } else {
          throwNewError('Specified account name already exists on chain.')
        }
      }
    }
    return newAccountName
  }

  /** Compose an updateAuth command to add a permission to the virtual 'master' account */
  private async composeCreateVirtualNestedAction(): Promise<EosActionStruct[]> {
    const { createVirtualNestedOptions, creatorPermission: authPermission } = this._options
    const { parentAccountName } = createVirtualNestedOptions || {}

    // add new 'nested' account permission at the bottom of the auth tree
    const newPermission = await this.composeNewVirualNestedAccountPermissionStructure()
    const updateAuthParams = {
      auth: newPermission.required_auth,
      authAccount: parentAccountName, // TODO: Consider removing parentAccountName as a seperate parameter
      authPermission,
      parent: newPermission.parent,
      permission: newPermission.perm_name,
    }
    const updateAuthAction = composeAction(ChainActionType.AccountUpdateAuth, updateAuthParams)
    return updateAuthAction
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

  /** extract keys from options or generate new keys
   *  Returns publicKeys and generatedKeys if created */
  private async getPublicKeysFromOptionsOrGenerateNewKeys() {
    let generatedKeys: any
    // generate new account owner/active keys if they weren't provided
    let { publicKeys } = this._options
    const { newKeysOptions } = this._options
    const { newKeysPassword, newKeysSalt } = newKeysOptions || {}

    // generate new public keys and add to options.publicKeyss
    if (isNullOrEmpty(publicKeys)) {
      generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(newKeysPassword, newKeysSalt, { publicKeys })
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
    if (!account) throw new Error('Invalid Option - Account name must be provided with recycle account option')
    const unusedAccountPublicKey = this._chainState?.chainSettings?.unusedAccountPublicKey
    // check that the public active key matches the unused public key marker
    const { publicKey } = account.permissions.find(perm => perm.name === toEosEntityName('active'))
    if (publicKey === unusedAccountPublicKey) return
    throw new Error(`Account ${account.name} in use and can't be recycled`)
  }

  private assertValidOptionPublicKeys() {
    const { publicKeys } = this._options
    const { active, owner } = publicKeys || {}
    if (!isNullOrEmpty(publicKeys) && (!isValidEosPublicKey(owner) || !isValidEosPublicKey(active))) {
      throwNewError('Invalid Option - For publicKeys option, you must provide both owner and active valid public keys')
    }
  }

  private assertValidOptionNewKeys() {
    const { newKeysOptions, publicKeys } = this._options
    const { newKeysPassword, newKeysSalt } = newKeysOptions || {}
    if (isNullOrEmpty(publicKeys) && (isNullOrEmpty(newKeysPassword) || isNullOrEmpty(newKeysSalt))) {
      throwNewError('Invalid Option - You must provide either public keys or a password AND salt to generate new keys')
    }
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
// authPermission // aka permission
// payer
// newAccountName // aka oreAccountName
// publicKeyOwner
// publicKeyActive
// pricekey = 1
// referralAccountName = ''  //aka referral

// ---> createEscrow params
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
