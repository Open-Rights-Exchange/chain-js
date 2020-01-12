/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../src/index'
import { ChainEndpoint, ChainSettings, AccountType } from '../src/models'
import { EosPrivateKey } from '../src/chains/eos_1_8/models'
import { EosAccount } from '../src/chains/eos_1_8/eosAccount'
import { ChainEosV18 } from '../src/chains/eos_1_8/ChainEosV18'
import { DeletePermissionsParams, LinkPermissionsParams } from '../src/chains/eos_1_8/eosPermissionsHelper'
import { toEosEntityName, toEosAsset, toEosPublicKey } from '../src/chains/eos_1_8/helpers'

require('dotenv').config()

// Example client code

const prepTransactionFromActions = async (chain: Chain, transactionActions: any, key: string) => {
  console.log('actions:', transactionActions)
  const transaction = (chain as ChainEosV18).new.transaction()
  transaction.actions = transactionActions
  await transaction.generateSerialized()
  await transaction.validate()
  transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

const prepTransaction = async (chain: Chain, transaction: any, key: string) => {
  console.log('actions:', transaction.actions)
  await transaction.generateSerialized()
  await transaction.validate()
  transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

const { env } = process
;(async () => {
  // Reusable Settings
  const kylinEndpoints = [
    {
      url: new URL('https:api-kylin.eosasia.one:443'),
      chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    },
  ]
  const oreStagingEndpoints = [
    {
      url: new URL('https://ore-staging.openrights.exchange/'),
      chainId: 'a6df478d5593b4efb1ea20d13ba8a3efc1364ee0bf7dbd85d8d756831c0e3256',
    },
  ]
  const ethEndpoint = {
    url: new URL('https://main-rpc.linkpool.io/'),
  }

  const chainSettings = { unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma' }

  // const oreStagingPrivateKey_apporeid = toEosPrivateKey('xxxx')
  // const moonlightorePrivateKey_apporeid = toEosPrivateKey('xxxx')

  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV18, kylinEndpoints, chainSettings)
  await kylin.connect()

  const oreStaging = new ChainFactory().create(ChainType.EosV18, oreStagingEndpoints, chainSettings)
  await oreStaging.connect()

  // Kylin createbridge - moonlighting
  const createAccountOptions_createBridge = {
    accountNamePrefix: 'ore',
    creatorAccountName: toEosEntityName('oreidfunding'),
    creatorPermission: toEosEntityName('active'),
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.EOS_KYLIN_PK_SALT_V0, // kylin
    },
    createEscrowOptions: {
      contractName: toEosEntityName('createbridge'),
      appName: 'appmoonlight',
    },
  }

  // ore-staging native account
  const createAccountOptions_OreNative = {
    accountNamePrefix: 'ore',
    creatorAccountName: 'app.oreid',
    creatorPermission: 'active',
    publicKeys: {
      owner: 'EOS7rNR9AhgcqkmMAoUSHrjTXgxM4PnpGYDXhS3B4UW3jjZgBATXL',
      active: 'EOS5GaFNg8Vdmddg5NSLUvixsVJtMrWvEWUD2hqJz59wH2vcZTqxj',
    },
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.ORE_TESTNET_PK_SALT_V0, // ore staging
    },
  }

  // kylin virutal account - moonlighting
  const createAccountOptions_virtualNested = {
    accountNamePrefix: 'ore',
    creatorAccountName: 'moonlightore',
    creatorPermission: 'active',
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.EOS_KYLIN_PK_SALT_V0, // kylin
    },
    createEscrowOptions: {
      contractName: 'createbridge',
      appName: 'free',
    },
    createVirtualNestedOptions: {
      parentAccountName: 'moonlightore',
      rootPermission: toEosEntityName('mloreidusers'),
    },
  }

  const createAccountOptions_EosNative = {
    accountNamePrefix: 'ore',
    // accountName: null,
    creatorAccountName: 'proppropprop',
    creatorPermission: 'active',
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.EOS_KYLIN_PK_SALT_V0, // kylin
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
  const createAccountOptions_OreRecycleNative = {
    accountNamePrefix: 'ore',
    creatorAccountName: 'ore1qadesjxm',
    creatorPermission: 'owner',
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.EOS_KYLIN_PK_SALT_V0, // ore staging
    },
  }

  const resetPermissions = [
    {
      name: toEosEntityName('active'),
      parent: toEosEntityName('owner'),
      publicKey: toEosPublicKey(chainSettings.unusedAccountPublicKey),
    },
  ]

  const permissionNewKeysOptions = {
    newKeysPassword: '2233',
    newKeysSalt: env.EOS_KYLIN_PK_SALT_V0, // kylin
  }

  const accountNewPermissions = [
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

  const accountDeletePermissions: Partial<DeletePermissionsParams>[] = [
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

  const accountLinkPermissions: LinkPermissionsParams[] = [
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

  // -------------------- Create Account -----------------------

  // -----> CreateAccount - createbridge
  // const createAccount = kylin.new.createAccount()
  // await createAccount.composeTransaction(AccountType.CreateEscrow, null, createAccountOptions_createBridge)
  // await prepTransaction(kylin, createAccount.transaction, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // console.log('createAccount response: ', await createAccount.transaction.send())

  // -----> CreateAccount - create native kylin account
  // const createAccount = kylin.new.createAccount()
  // await createAccount.composeTransaction(AccountType.Native, null, createAccountOptions_EosNative)
  // await prepTransaction(kylin, createAccount.transaction, env.KYLIN_proppropprop_PRIVATE_KEY)
  // createAccount.transaction.sign([env.KYLIN_proppropprop_PRIVATE_KEY])
  // console.log('createAccount response: ', await createAccount.transaction.send())

  // -----> CreateAccount - create virtual nested account
  // const createAccount = kylin.new.createAccount()
  // await createAccount.composeTransaction(AccountType.VirtualNested, null, createAccountOptions_virtualNested)
  // await prepTransaction(kylin, createAccount.transaction, env.KYLIN_moonlightore_PRIVATE_KEY)
  // console.log('createAccount response: ', await createAccount.transaction.send())

  // // -----> Reset account to be recyclable
  // const recycleAccount = (await kylin.new.account('ore1qadesjxm')) as EosAccount
  // console.log('ore1qadesjxm account permissions:', recycleAccount.permissions)
  // const { generatedKeys, actions } = await recycleAccount.composeAddPermissionsActions(
  //   toEosEntityName('owner'),
  //   resetPermissions,
  // )
  // const transaction = await prepTransactionFromActions(kylin, actions, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // console.log('response:', await transaction.send())

  // // -----> CreateAccount - recycle native ORE account
  // const recycleAccount = kylin.new.createAccount()
  // await recycleAccount.composeTransaction(AccountType.Native, 'ore1qadesjxm', createAccountOptions_OreRecycleNative)
  // await prepTransaction(kylin, recycleAccount.transaction, env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)
  // console.log('createAccount response: ', await recycleAccount.transaction.send())

  // -------------------- Permissions -----------------------

  // // ------> AddPermissions to account
  // const account = (await kylin.new.account('ore1qbmd2nvu')) as EosAccount
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
  // const account = (await kylin.new.account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeDeletePermissionsActions(toEosEntityName('owner'), accountDeletePermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('response:', await transaction.send())

  // -----> link Permissions
  // const account = (await kylin.new.account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeLinkPermissionsActions(toEosEntityName('owner'), accountLinkPermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('response:', await transaction.send())

  // -----> unlink Permissions
  // const account = (await kylin.new.account('ore1qbmd2nvu')) as EosAccount
  // const actions = await account.composeUnlinkPermissionsActions(toEosEntityName('owner'), accountLinkPermissions)
  // const transaction = await prepTransactionFromActions(kylin, actions, env.KYLIN_proppropprop_PRIVATE_KEY)
  // console.log('response:', await transaction.send())
})()
