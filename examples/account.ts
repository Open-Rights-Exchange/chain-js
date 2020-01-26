/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../src/index'
import { ChainEndpoint, ChainSettings, NewAccountType } from '../src/models'
import {
  EosPrivateKey,
  EosNewAccountType,
  EosActionStruct,
  LinkPermissionsParams,
  DeletePermissionsParams,
  UnlinkPermissionsParams,
} from '../src/chains/eos_1_8/models'
import { EosAccount } from '../src/chains/eos_1_8/eosAccount'
import { ChainEosV18 } from '../src/chains/eos_1_8/ChainEosV18'
import { toEosEntityName, toEosAsset, toEosPublicKey } from '../src/chains/eos_1_8/helpers'

require('dotenv').config()

export const { env } = process

// Helper functions
export const prepTransactionFromActions = async (chain: Chain, transactionActions: any, key: string) => {
  console.log('actions:', transactionActions)
  const transaction = (chain as ChainEosV18).new.Transaction()
  transaction.actions = transactionActions
  await transaction.generateSerialized()
  await transaction.validate()
  transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

export const prepTransaction = async (chain: Chain, transaction: any, key: string) => {
  console.log('actions:', transaction.actions)
  await transaction.generateSerialized()
  await transaction.validate()
  transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

// Reusable Settings
export const kylinEndpoints = [
  {
    url: new URL('https:api-kylin.eosasia.one:443'),
  },
]
export const oreStagingEndpoints = [
  {
    url: new URL('https://ore-staging.openrights.exchange/'),
  },
  {
    url: new URL('https://ore-staging2.openrights.exchange/'),
  },
]
export const ethEndpoint = {
  url: new URL('https://main-rpc.linkpool.io/'),
}

export const chainSettings = {
  unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
}

// Kylin createbridge - moonlighting
export const createAccountOptions_createBridge = {
  accountNamePrefix: 'ore',
  creatorAccountName: toEosEntityName('oreidfunding'),
  creatorPermission: toEosEntityName('active'),
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
  },
  createEscrowOptions: {
    contractName: toEosEntityName('createbridge'),
    appName: 'free',
  },
}

// ore-staging native account
export const createAccountOptions_OreNative = {
  accountNamePrefix: 'ore',
  creatorAccountName: 'app.oreid',
  creatorPermission: 'active',
  publicKeys: {
    owner: 'EOS7rNR9AhgcqkmMAoUSHrjTXgxM4PnpGYDXhS3B4UW3jjZgBATXL',
  },
  newKeysOptions: {
    password: '2233',
    salt: env.$ORE_TESTNET_PK_SALT_V0, // ore staging
  },
}

// kylin virutal account - moonlighting
export const createAccountOptions_virtualNested = {
  accountNamePrefix: 'ore',
  creatorAccountName: 'moonlightore',
  creatorPermission: 'active',
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
  },
  createEscrowOptions: {
    contractName: 'createbridge',
    appName: 'free',
  },
  createVirtualNestedOptions: {
    parentAccountName: 'moonlightore',
    rootPermission: toEosEntityName('mloreidusers'),
    actionsToLink: [
      {
        contract: 'dsptestacc11',
        action: 'addwhitelist',
      },
      {
        contract: 'dsptestacc11',
        action: 'claimhash',
      },
    ],
  },
}

export const createAccountOptions_EosNative = {
  accountNamePrefix: 'ore',
  accountName: 'ore1qcfacksc',
  creatorAccountName: 'proppropprop',
  creatorPermission: 'active',
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
  },
  publicKeys: {
    owner: 'EOS5TjGeH12cqxKrXExiQohiVZo8utowncv7Qg4FbFUhbwVNgUbKs',
    // active: 'EOS5TjGeH12cqxKrXExiQohiVZo8utowncv7Qg4FbFUhbwVNgUbKs',
  },
  resourcesOptions: {
    ramBytes: 4000,
    stakeNetQuantity: toEosAsset(1, 'EOS'),
    stakeCpuQuantity: toEosAsset(1, 'EOS'),
    transfer: false,
  },
}

// to recylce an account, specify an existing account with an active key of unusedAccountPublicKey
export const createAccountOptions_OreRecycleNative = {
  accountName: 'ore1qadesjxm',
  accountNamePrefix: 'ore',
  creatorAccountName: 'ore1qadesjxm',
  creatorPermission: 'owner',
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
  },
}

export const resetPermissions = [
  {
    name: toEosEntityName('active'),
    parent: toEosEntityName('owner'),
    publicKey: toEosPublicKey(chainSettings.unusedAccountPublicKey),
  },
]

export const permissionNewKeysOptions = {
  password: '2233',
  salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
}

export const accountNewPermissions = [
  {
    name: toEosEntityName('nwpermission'),
    parent: toEosEntityName('active'),
  },
  {
    name: toEosEntityName('n2permission'),
    parent: toEosEntityName('active'),
  },
  {
    name: toEosEntityName('n3permission'),
    parent: toEosEntityName('nwpermission'),
  },
]

export const accountDeletePermissions: Partial<DeletePermissionsParams>[] = [
  {
    permissionName: toEosEntityName('nwpermission'),
  },
  {
    permissionName: toEosEntityName('n2permission'),
  },
  {
    permissionName: toEosEntityName('n3permission'),
  },
]

export const accountDeleteDemoPermissions: Partial<DeletePermissionsParams>[] = [
  {
    permissionName: toEosEntityName('appdemoappli'),
  },
]

export const accountUnlinkDemoPermissions: UnlinkPermissionsParams[] = [
  {
    permissionName: toEosEntityName('appdemoappli'),
    contract: toEosEntityName('demoapphello'),
    action: toEosEntityName('hi'),
  },
]

export const accountLinkPermissions: LinkPermissionsParams[] = [
  {
    permissionName: toEosEntityName('nwpermission'),
    contract: toEosEntityName('createbridge'),
    action: toEosEntityName('create'),
  },
  {
    permissionName: toEosEntityName('n2permission'),
    contract: toEosEntityName('createbridge'),
    action: toEosEntityName('define'),
  },
]
;(async () => {
  //
  // Example funcions - uncomment and run
  // You must first create an .env file in the root of the examples folder with the private keys and other secrets
  // e.g. env.KYLIN_proppropprop_PRIVATE_KEY
  // then from the command line inside this directory, run using ... npx ts-node --files ./thisfilename.ts

  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV18, kylinEndpoints, chainSettings)
  await kylin.connect()

  const oreStaging = new ChainFactory().create(ChainType.EosV18, oreStagingEndpoints, chainSettings)
  await oreStaging.connect()

  // -------------------- Create Account -----------------------

  // -----> CreateAccount - createbridge
  // const createAccount = kylin.new.CreateAccount()
  // await createAccount.composeTransaction(EosNewAccountType.CreateEscrow, createAccountOptions_createBridge)
  // await prepTransaction(kylin, createAccount.transaction, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // console.log('createAccount response: ', await createAccount.transaction.send())

  // -----> CreateAccount - create native kylin account
  // const createAccount = kylin.new.CreateAccount()
  // await createAccount.composeTransaction(EosNewAccountType.Native, createAccountOptions_EosNative)
  // await prepTransaction(kylin, createAccount.transaction, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('createAccount response: ', await createAccount.transaction.send())

  // -----> CreateAccount - create native ore-staging account
  // const createAccount = oreStaging.new.CreateAccount()
  // await createAccount.composeTransaction(EosNewAccountType.NativeOre, createAccountOptions_OreNative)
  // await prepTransaction(oreStaging, createAccount.transaction, env.ORE_TESTNET_APPOREID_PRIVATE_KEY)
  // console.log(JSON.stringify(createAccount.transaction.toJson()))
  // console.log('createAccount response: ', await createAccount.transaction.send())

  // -----> CreateAccount - create virtual nested account
  // const createAccount = kylin.new.CreateAccount()
  // await createAccount.composeTransaction(EosNewAccountType.VirtualNested, createAccountOptions_virtualNested)
  // await prepTransaction(kylin, createAccount.transaction, env.KYLIN_moonlightore_PRIVATE_KEY)
  // console.log('createAccount response: ', await createAccount.transaction.send())

  // // -----> Reset account to be recyclable
  // const recycleAccount = (await kylin.new.Account('ore1qadesjxm')) as EosAccount
  // console.log('ore1qadesjxm account permissions:', recycleAccount.permissions)
  // const { generatedKeys, actions } = await recycleAccount.composeAddPermissionsActions(
  //   toEosEntityName('owner'),
  //   resetPermissions,
  //   null,
  //   false,
  // )
  // console.log('generated Keys:', generatedKeys)
  // console.log('actions:', actions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // console.log('response:', await transaction.send())

  // // -----> CreateAccount - recycle native Kylin account
  // const account = await kylin.new.Account(createAccountOptions_OreRecycleNative.accountName)
  // console.log('account can be recycled:', account.canBeRecycled)
  // if (account.canBeRecycled) {
  //   const recycleAccount = kylin.new.CreateAccount()
  //   await recycleAccount.composeTransaction(EosNewAccountType.Native, createAccountOptions_OreRecycleNative)
  //   await prepTransaction(kylin, recycleAccount.transaction, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  //   console.log('createAccount response: ', await recycleAccount.transaction.send())
  // }

  // -------------------- Permissions -----------------------

  // // ------> AddPermissions to account
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // console.log('ore1qbmd2nvu account permissions:', account.permissions)
  // const { generatedKeys, actions } = await account.composeAddPermissionsActions(
  //   toEosEntityName('owner'),
  //   accountNewPermissions,
  //   permissionNewKeysOptions,
  // )
  // console.log('createAccount.generatedKeys:', JSON.stringify(generatedKeys))
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('response:', await transaction.send())

  // -----> Delete Permissions
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeDeletePermissionsActions(toEosEntityName('owner'), accountDeletePermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('response:', await transaction.send())

  // -----> Unlink and Delete Permissions
  // const account = (await kylin.new.Account('ore1qctfkfhw')) as EosAccount
  // const actionsUnlink = await account.composeUnlinkPermissionsActions(toEosEntityName('owner'), accountUnlinkDemoPermissions)
  // const actionsDelete = await account.composeDeletePermissionsActions(toEosEntityName('owner'), accountDeleteDemoPermissions)
  // const transaction = await prepTransactionFromActions(kylin, [...actionsUnlink, ...actionsDelete], env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // console.log('actionsDelete:', JSON.stringify(actionsDelete))
  // console.log('response:', await transaction.send())

  // -----> link Permissions
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeLinkPermissionsActions(toEosEntityName('owner'), accountLinkPermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('response:', await transaction.send())

  // -----> unlink Permissions
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeUnlinkPermissionsActions(toEosEntityName('owner'), accountLinkPermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('response:', await transaction.send())
})()
