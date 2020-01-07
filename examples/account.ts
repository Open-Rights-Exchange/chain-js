/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../src/index'
import { ChainEndpoint, ChainSettings, AccountType } from '../src/models'
import { toEosEntityName, toEosPrivateKey, toEosPublicKey } from '../src/chains/eos_1_8/models'
import { CreateAccountOptions } from '../src/chains/eos_1_8/eosCreateAccount'

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
    payerAccountName: toEosEntityName('oreidfunding'),
    payerAccountPermissionName: toEosEntityName('active'),
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.EOS_KYLIN_PK_SALT_V0, // kylin
    },
    createEscrowOptions: {
      contractName: toEosEntityName('createbridge'),
      appName: 'free',
    },
  }

  // ore-staging native account
  const createAccountOptions_OreNative = {
    accountNamePrefix: 'ore',
    payerAccountName: 'app.oreid',
    payerAccountPermissionName: 'active',
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.ORE_TESTNET_PK_SALT_V0, // ore staging
    },
    permissionsToAdd: [
      {
        name: toEosEntityName('nwpermission'),
        parent: toEosEntityName('active'),
      },
      {
        name: toEosEntityName('n2permission'),
        parent: toEosEntityName('nwpermission'),
      },
    ],
  }

  // ore-staging native account
  const createAccountOptions_OreRecycleNative = {
    recycleExistingAccount: true,
    accountNamePrefix: 'ore',
    payerAccountName: 'app.oreid',
    payerAccountPermissionName: 'active',
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.ORE_TESTNET_PK_SALT_V0, // ore staging
    },
  }

  // kylin virutal account - moonlighting
  const createAccountOptions_virtualNested = {
    accountNamePrefix: 'ore',
    payerAccountName: 'moonlightore',
    payerAccountPermissionName: 'active',
    newKeysOptions: {
      newKeysPassword: '2233',
      newKeysSalt: env.EOS_KYLIN_PK_SALT_V0, // kylin
    },
    // createEscrowOptions: {
    //   contractName: 'createbridge',
    //   appName: 'free'
    // },
    // createVirtualNestedOptions: {
    //   parentAccountName: 'moonlightore',
    //   rootPermission: toEosEntityName('mloreidusers'),
    // }
  }

  // -----> CreateAccount - createbridge
  // let createAccount = kylin.newCreateAccount()
  // await createAccount.composeTransaction(AccountType.CreateEscrow, null, createAccountOptions_createBridge)
  // // let privateKey = kylin.crypto.decrypt(env.KYLIN_moonlightore_PRIVATE_KEY_ENCRYPTED, env.ORE_TESTNET_APPOREID_PRIVATE_KEY, env.ORE_TESTNET_ENCRYPTION_SALT)
  // // console.log('privateKey:',privateKey)
  // createAccount.transaction.sign([env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY])
  // console.log('missing signatures:', createAccount.transaction.missingSignatures)
  // // await createAccount.transaction.send()
  // console.log(createAccount.transaction.toJson())

  // -----> CreateAccount - create native ORE account
  await oreStaging.connect()
  const createAccount = oreStaging.newCreateAccount()
  await createAccount.composeTransaction(AccountType.NativeOre, null, createAccountOptions_OreNative)
  createAccount.transaction.sign([env.ORE_TESTNET_APPOREID_PRIVATE_KEY])
  console.log('missing sigs:', await createAccount.transaction.missingSignatures)
  // let response = await createAccount.transaction.send()
  // console.log('createAccount response: ', response)
  console.log(JSON.stringify(createAccount.transaction.toJson()))
  console.log('createAccount.generatedKeys:', JSON.stringify(createAccount.generatedKeys))

  // -----> CreateAccount - create virtual nested account
  // await kylin.connect()
  // let createAccount = kylin.newCreateAccount()
  // await createAccount.composeTransaction(AccountType.VirtualNested, null, createAccountOptions_virtualNested)
  // createAccount.transaction.sign([env.KYLIN_moonlightore_PRIVATE_KEY]);
  // let response = await createAccount.transaction.send()
  // console.log(createAccount.transaction.toJson())
  // console.log('response: ', response);

  // // -----> CreateAccount - recycle native ORE account
  // await oreStaging.connect()
  // let recycleAccount = oreStaging.newCreateAccount()
  // await recycleAccount.composeTransaction(AccountType.NativeOre,'ore1qadesjxm', createAccountOptions_OreRecycleNative)
  // recycleAccount.transaction.sign([env.ORE_TESTNET_APPOREID_PRIVATE_KEY])
  // let response = await recycleAccount.transaction.send()
  // // console.log('createAccount response: ', response)
  // console.log(JSON.stringify(recycleAccount.transaction.actions))
  // console.log('missing sigs:', await recycleAccount.transaction.missingSignatures)
})()
