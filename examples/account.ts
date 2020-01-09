/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../src/index'
import { ChainEndpoint, ChainSettings, AccountType } from '../src/models'
import { toEosEntityName, toEosPrivateKey, toEosPublicKey } from '../src/chains/eos_1_8/models'
import { CreateAccountOptions } from '../src/chains/eos_1_8/eosCreateAccount'
import { EosAccount } from '../src/chains/eos_1_8/eosAccount'

require('dotenv').config()

// Example client code

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
    // permissionsToAdd: [
    //   // {
    //   //   name: toEosEntityName('nwpermission'),
    //   //   parent: toEosEntityName('active'),
    //   // },
    //   // {
    //   //   name: toEosEntityName('n2permission'),
    //   //   parent: toEosEntityName('active'),
    //   // },
    //   // {
    //   //   name: toEosEntityName('n3permission'),
    //   //   parent: toEosEntityName('nwpermission'),
    //   // },
    // ],
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

  // -----> CreateAccount - createbridge
  // const createAccount = kylin.newCreateAccount()
  // await createAccount.composeTransaction(AccountType.CreateEscrow, null, createAccountOptions_createBridge)
  // // let privateKey = kylin.crypto.decrypt(env.KYLIN_moonlightore_PRIVATE_KEY_ENCRYPTED, env.ORE_TESTNET_APPOREID_PRIVATE_KEY, env.ORE_TESTNET_ENCRYPTION_SALT)
  // // console.log('privateKey:',privateKey)
  // createAccount.transaction.sign([env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY])
  // console.log('missing signatures:', createAccount.transaction.missingSignatures)
  // const response = await createAccount.transaction.send()
  // console.log(JSON.stringify(createAccount.transaction.toJson()))
  // console.log('response:', response)

  // -----> CreateAccount - create native ORE account
  // await oreStaging.connect()
  // const createAccount = oreStaging.newCreateAccount()
  // await createAccount.composeTransaction(AccountType.NativeOre, null, createAccountOptions_OreNative)
  // console.log('got here')
  // createAccount.transaction.sign([env.ORE_TESTNET_APPOREID_PRIVATE_KEY])
  // console.log('missing sigs:', createAccount.transaction.missingSignatures)
  // console.log('transction:', JSON.stringify(createAccount.transaction.toJson()))
  // console.log('createAccount.generatedKeys:', JSON.stringify(createAccount.generatedKeys))
  // const response = await createAccount.transaction.send()
  // console.log('createAccount response: ', response)

  // ------> AddPermissions to account
  await oreStaging.connect()
  const account = (await oreStaging.newAccount('ore1qafpgffi')) as EosAccount
  console.log('ore1qafpgffi account permissions:', account.permissions)
  const { generatedKeys, actions } = await account.composeAddPermissionsActions(
    toEosEntityName('ore1qafpgffi'),
    toEosEntityName('owner'),
    accountNewPermissions,
    permissionNewKeysOptions,
  )
  console.log('action::', JSON.stringify(actions))
  console.log('createAccount.generatedKeys:', JSON.stringify(generatedKeys))

  // const transaction = oreStaging.newTransaction()
  // transaction.actions = actions
  // await transaction.generateSerialized()
  // await transaction.validate()
  // transaction.sign([env.ORE_TESTNET_APPOREID_PRIVATE_KEY])
  // const response = await transaction.send()
  // // console.log('permission add actions:', generatedKeys, JSON.stringify(actions))
  // console.log('transaction response:', response)
  // console.log('transaction:', JSON.stringify(transaction.toJson()))

  // -----> CreateAccount - create virtual nested account
  // await kylin.connect()
  // const createAccount = kylin.newCreateAccount()
  // await createAccount.composeTransaction(AccountType.VirtualNested, null, createAccountOptions_virtualNested)
  // createAccount.transaction.sign([env.KYLIN_moonlightore_PRIVATE_KEY])
  // const response = await createAccount.transaction.send()
  // console.log('missing signatures: ', createAccount.transaction.missingSignatures)
  // console.log(JSON.stringify(createAccount.transaction.toJson()))
  // console.log('response: ', response)

  // // -----> Reset account to be recyclable

  // const resetPermissions = [
  //   {
  //     name: toEosEntityName('active'),
  //     parent: toEosEntityName('owner'),
  //     publicKey: toEosPublicKey(chainSettings.unusedAccountPublicKey),
  //   },
  // ]
  // await oreStaging.connect()
  // const recycleAccount = (await oreStaging.newAccount('ore1qadesjxm')) as EosAccount
  // console.log('ore1qadesjxm account permissions:', recycleAccount.permissions)
  // const { generatedKeys, actions } = await recycleAccount.composeAddPermissionsActions(
  //   toEosEntityName('ore1qadesjxm'),
  //   toEosEntityName('owner'),
  //   resetPermissions,
  // )
  // const transaction = oreStaging.newTransaction()
  // transaction.actions = actions
  // await transaction.generateSerialized()
  // await transaction.validate()
  // transaction.sign([env.ORE_TESTNET_APPOREID_PRIVATE_KEY])
  // const response = await transaction.send()
  // console.log('createAccount response: ', response)

  // // -----> CreateAccount - recycle native ORE account
  // ore-staging native account
  //   const createAccountOptions_OreRecycleNative = {
  //     recycleExistingAccount: true,
  //     accountNamePrefix: 'ore',
  //     creatorAccountName: 'ore1qadesjxm',
  //     creatorPermission: 'owner',
  //     newKeysOptions: {
  //       newKeysPassword: '2233',
  //       newKeysSalt: env.ORE_TESTNET_PK_SALT_V0, // ore staging
  //     },
  //   }
  //   await oreStaging.connect()
  //   const recycleAccount = oreStaging.newCreateAccount()
  //   await recycleAccount.composeTransaction(AccountType.NativeOre, 'ore1qadesjxm', createAccountOptions_OreRecycleNative)
  //   recycleAccount.transaction.sign([env.ORE_TESTNET_APPOREID_PRIVATE_KEY])
  //   console.log(JSON.stringify(recycleAccount.transaction.toJson()))
  //   // const response = await recycleAccount.transaction.send()
  //   // console.log('createAccount response: ', response)
  //   console.log(JSON.stringify(recycleAccount.transaction.actions))
  //   console.log('signatures:', recycleAccount.transaction.signatures)
  //   console.log('missing sigs:', recycleAccount.transaction.missingSignatures)
})()
