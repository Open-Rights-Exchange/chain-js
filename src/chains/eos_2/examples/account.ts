/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ConfirmType } from '../../../models'
import { Chain, ChainFactory, ChainType, CreateAccount, Crypto, Models } from '../../../index'
import { AesCrypto } from '../../../crypto'
import {
  EosPrivateKey,
  EosNewAccountType,
  EosActionStruct,
  LinkPermissionsParams,
  DeletePermissionsParams,
  UnlinkPermissionsParams,
} from '../models'
import { EosAccount } from '../eosAccount'
import { ChainEosV2 } from '../ChainEosV2'
import { toEosEntityName, toEosAsset, toEosPublicKey } from '../helpers'

require('dotenv').config()

export const { env } = process

// Helper functions
export const prepTransactionFromActions = async (chain: Chain, transactionActions: any, key: string) => {
  console.log('actions:', transactionActions)
  const transaction = await (chain as ChainEosV2).new.Transaction()
  transaction.actions = transactionActions
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

export const prepTransaction = async (chain: Chain, transaction: any, key: string) => {
  console.log('actions:', transaction.actions)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

// Reusable Settings
export const kylinEndpoints = [
  {
    url: 'https:api-kylin.eosasia.one:443',
  },
  {
    url: 'https:api-kylin.eoslaomao.com:443',
  },
  {
    url: 'https:kylin.eosusa.news',
  },
]

export const eosMainEndpoints = [
  {
    url: 'https://api.eosn.io:443',
  },
]

export const oreStagingEndpoints = [
  {
    url: 'https://ore-staging.openrights.exchange/',
  },
  {
    url: 'https://ore-staging2.openrights.exchange/',
  },
]
export const ethEndpoint = {
  url: 'https://main-rpc.linkpool.io/',
}

export const chainSettings = {
  unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
}

// Kylin createescrow - moonlighting
export const createAccountOptions_createescrow = {
  accountNamePrefix: 'ore',
  creatorAccountName: toEosEntityName('oreidfunding'),
  creatorPermission: toEosEntityName('active'),
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
  },
  createEscrowOptions: {
    contractName: toEosEntityName('createescrow'),
    appName: 'free',
  },
}

// ore-staging native account
export const createAccountOptions_OreNative = {
  accountNamePrefix: toEosEntityName('ore'),
  creatorAccountName: toEosEntityName('app.oreid'),
  creatorPermission: toEosEntityName('active'),
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
    contractName: 'createescrow',
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
  // accountName: 'ore1qcfadksc',
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
    stakeNetQuantity: toEosAsset('1.0000', 'EOS'),
    stakeCpuQuantity: toEosAsset('1.0000', 'EOS'),
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
  // {
  //   name: toEosEntityName('n3permission'),
  //   parent: toEosEntityName('nwpermission'),
  // },
]

export const accountDeletePermissions: Partial<DeletePermissionsParams>[] = [
  {
    permissionName: toEosEntityName('nwpermission'),
  },
  {
    permissionName: toEosEntityName('n2permission'),
  },
  // {
  //   permissionName: toEosEntityName('n3permission'),
  // },
]

export const accountDeleteDemoPermissions: Partial<DeletePermissionsParams>[] = [
  {
    permissionName: toEosEntityName('appdemoappli'),
  },
]

export const accountUnlinkDemoPermissions: UnlinkPermissionsParams[] = [
  {
    contract: toEosEntityName('demoapphello'),
    action: toEosEntityName('hi'),
  },
]

export const accountLinkPermissions: LinkPermissionsParams[] = [
  {
    permissionName: toEosEntityName('nwpermission'),
    contract: toEosEntityName('createescrow'),
    action: toEosEntityName('create'),
  },
  {
    permissionName: toEosEntityName('n2permission'),
    contract: toEosEntityName('createescrow'),
    action: toEosEntityName('define'),
  },
]
async function run() {
  //
  // Example funcions - uncomment and run
  // You must first create an .env file in the root of the examples folder with the private keys and other secrets
  // e.g. env.KYLIN_proppropprop_PRIVATE_KEY
  // then from the command line inside this directory, run using ... npx ts-node --files ./thisfilename.ts

  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV2, kylinEndpoints, chainSettings)
  await kylin.connect()

  const eosMain = new ChainFactory().create(ChainType.EosV2, eosMainEndpoints, chainSettings)
  await eosMain.connect()

  const oreStaging = new ChainFactory().create(ChainType.EosV2, oreStagingEndpoints, chainSettings)
  await oreStaging.connect()

  // -------------------- Create Account -----------------------

  // -----> List public keys in account
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // console.log('account permissions :', account.permissions)
  // console.log('account public keys:', account.publicKeys)

  // -----> CreateAccount - createescrow
  // const createAccount = await kylin.new.CreateAccount(createAccountOptions_createescrow)
  // await createAccount.composeTransaction(EosNewAccountType.CreateEscrow)
  // await prepTransaction(kylin, createAccount.transaction, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // const txResponse = await createAccount.transaction.send(ConfirmType.After001)
  // console.log('createAccount response: ', JSON.stringify(txResponse))
  // console.log('missing signatures: ', createAccount.transaction.missingSignatures)
  // console.log('deserialized transaction: ', createAccount.transaction.toJson())
  // console.log('transaction auths: ', createAccount.transaction.requiredAuthorizations)

  // -----> CreateAccount - create native kylin account
  const createAccount = await kylin.new.CreateAccount(createAccountOptions_EosNative)
  createAccount.generateKeysIfNeeded()
  if (createAccount.supportsTransactionToCreateAccount) {
    await createAccount.composeTransaction(EosNewAccountType.Native)
    await prepTransaction(kylin, createAccount.transaction, env.KYLIN_proppropprop_PRIVATE_KEY)
    console.log('createAccount.generatedKeys: ', createAccount.generatedKeys.accountKeys)
    const txResponse = await createAccount.transaction.send()
    console.log('createAccount response: ', JSON.stringify(txResponse))
  }

  // -----> CreateAccount - create native ore-staging account
  // const createAccount = await oreStaging.new.CreateAccount(createAccountOptions_OreNative)
  // await createAccount.generateKeysIfNeeded()
  // if (createAccount.supportsTransactionToCreateAccount) {
  //   await createAccount.composeTransaction(EosNewAccountType.NativeOre)
  //   await prepTransaction(oreStaging, createAccount.transaction, env.ORE_TESTNET_APPOREID_PRIVATE_KEY)
  //   console.log(JSON.stringify(createAccount.transaction.toJson()))
  //   const txResponse = await createAccount.transaction.send()
  //   console.log('createAccount response: ', JSON.stringify(txResponse))
  // }
  // console.log('generatedKeys:', createAccount.generatedKeys)

  // -----> CreateAccount - create virtual nested account
  // const createAccount = await kylin.new.CreateAccount(createAccountOptions_virtualNested)
  // await createAccount.composeTransaction(EosNewAccountType.VirtualNested)
  // await prepTransaction(kylin, createAccount.transaction, env.KYLIN_moonlightore_PRIVATE_KEY)
  // const txResponse = await createAccount.transaction.send()
  // console.log('createAccount response: ', JSON.stringify(txResponse))

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
  // const txResponse = await transaction.send()
  // console.log('send response:', JSON.stringify(txResponse))

  // -----> CreateAccount - recycle native Kylin account
  // const account = await kylin.new.Account(createAccountOptions_OreRecycleNative.accountName)
  // console.log('account can be recycled:', account.canBeRecycled)
  // if (account.supportsRecycling && account.canBeRecycled) {
  //   const recycleAccount = await kylin.new.CreateAccount(createAccountOptions_OreRecycleNative)
  //   await recycleAccount.composeTransaction(EosNewAccountType.Native)
  //   await prepTransaction(kylin, recycleAccount.transaction, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  //   console.log('createAccount response: ', await recycleAccount.transaction.send())
  // }

  // -------------------- Permissions -----------------------

  // ------> AddPermissions to account
  // const account = (await kylin.new.Account('ore1retmquy2')) as EosAccount
  // console.log('ore1qbmd2nvu account permissions:', account.permissions)
  // const { generatedKeys, actions } = await account.composeAddPermissionsActions(
  //   toEosEntityName('owner'),
  //   accountNewPermissions,
  //   permissionNewKeysOptions,
  // )
  // console.log('generatedKeys:', JSON.stringify(generatedKeys))
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // const txResponse = await transaction.send()
  // console.log('send response:', JSON.stringify(txResponse))

  // -----> Delete Permissions
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeDeletePermissionsActions(toEosEntityName('owner'), accountDeletePermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // const txResponse = await transaction.send()
  // console.log('send response:', JSON.stringify(txResponse))

  // -----> Unlink and Delete Permissions
  // const account = (await kylin.new.Account('ore1qctfkfhw')) as EosAccount
  // const actionsUnlink = await account.composeUnlinkPermissionsActions(toEosEntityName('owner'), accountUnlinkDemoPermissions)
  // const actionsDelete = await account.composeDeletePermissionsActions(toEosEntityName('owner'), accountDeleteDemoPermissions)
  // const transaction = await prepTransactionFromActions(kylin, [...actionsUnlink, ...actionsDelete], env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // console.log('actionsDelete:', JSON.stringify(actionsDelete))
  // const txResponse = await transaction.send()
  // console.log('send response:', JSON.stringify(txResponse))

  // -----> link Permissions
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeLinkPermissionsActions(toEosEntityName('owner'), accountLinkPermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // const txResponse = await transaction.send()
  // console.log('send response:', JSON.stringify(txResponse))

  // -----> unlink Permissions
  // const account = (await kylin.new.Account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeUnlinkPermissionsActions(toEosEntityName('owner'), accountLinkPermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // const txResponse = await transaction.send()
  // console.log('send response:', JSON.stringify(txResponse))
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
