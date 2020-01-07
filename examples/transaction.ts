/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { RpcError } from 'eosjs'
import { Chain, ChainFactory, ChainType } from '../src/index'
import { ChainEndpoint, ChainSettings, AccountType } from '../src/models'
import { toEosEntityName, toEosPrivateKey, toEosPublicKey } from '../src/chains/eos_1_8/models'
import { EosAccount } from '../src/chains/eos_1_8/eosAccount'
import { EosTransaction } from '../src/chains/eos_1_8/eosTransaction'
import { EosChainV18 } from '../src/chains/eos_1_8/EosChainV18'

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

  const kylinPrivateKey_proppropprop = toEosPrivateKey(env.KYLIN_PROPPROPPROP_PRIVATE_KEY)
  const kylinPrivateKey_oreidfunding = env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY

  const sampleSerializedTransaction =
    '{"serializedTransaction":{"0":46,"1":143,"2":11,"3":94,"4":147,"5":127,"6":71,"7":23,"8":9,"9":176,"10":0,"11":0,"12":0,"13":0,"14":1,"15":64,"16":99,"17":84,"18":173,"19":86,"20":67,"21":165,"22":74,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":128,"30":107,"31":1,"32":224,"33":214,"34":98,"35":117,"36":25,"37":27,"38":212,"39":165,"40":224,"41":98,"42":173,"43":134,"44":74,"45":149,"46":106,"47":53,"48":8,"49":224,"50":214,"51":98,"52":117,"53":25,"54":27,"55":212,"56":165,"57":0},"signatures":["SIG_K1_K7dahqzaYaZYCqvYFW2jEPMPZS5etQHAbgYu9CTFwvJy7xSzuZ3u7oAuSkrNEo4ZXUMqZpeAmpvqEbd3bfpCHdHHXRGavc"]}'
  const sampleActionsDemoApp = JSON.parse(
    '{"account":"demoapphello","name":"hi","authorization":[{"actor":"ore1qafpgffi","permission":"appdemoappli"}],"data":{"user":"ore1qafpgffi"}}',
  )
  const sampleActionFirstAuth = JSON.parse(
    '{"account":"createbridge","name":"ping","authorization":[{"actor":"proppropprop","permission":"active"}],"data":{"from":"ore1qafpgffi"}}',
  )
  const sampleActionData_UpdateAuthSetActiveToUnused = JSON.parse(
    '{"account":"eosio","name":"updateauth","authorization":[{"actor":"ore1qadesjxm","permission":"owner"}],"data":{"account":"ore1qadesjxm","permission":"active","parent":"owner","auth":{"accounts":[],"keys":[{"key":"EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma","weight":1}],"threshold":1,"waits":[]}}}',
  )
  const { serializedTransaction, signatures } = JSON.parse(sampleSerializedTransaction)

  // privateKeyEncryptionMethod salt - eks0
  const ore1qafpgffi_privateKeyEncrypted =
    '{"iv":"khoV+oSVlnBFK4YsUC+15Q==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","ct":"K2b/Zcrnby9wF8GAUd6HQyQW2fwACCK/UvjORd3jqApXm71nQhDZUtHu2C3ljjYb2JpvBt7jRvBzqWQ="}'
  const ore1qafpgffi_salt = env.EOS_KYLIN_PW_SALT_V0

  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV18, kylinEndpoints, chainSettings)
  await kylin.connect()
  console.log('Chain ID:', kylin.chainId)

  const orestaging = new ChainFactory().create(ChainType.EosV18, oreStagingEndpoints, chainSettings) as EosChainV18
  await orestaging.connect()

  //  ---> set transaction from serialized
  // let transaction = kylin.newTransaction({blocksBehind:10})
  // await transaction.setSerialized(serializedTransaction)
  // await transaction.validate()
  // console.log(`missing signatures:`, transaction.missingSignatures)
  // transaction.signatures = signatures
  // await transaction.validate()

  // console.log('hasAllRequiredSignatures:', transaction.hasAllRequiredSignatures);
  // console.log('actions:', JSON.stringify(transaction.actions));
  // console.log('header:', transaction.header);
  // console.log('signatures:', transaction.signatures);
  // ----<

  // ---> set transaction from actions

  const transaction = kylin.newTransaction()
  transaction.actions = [sampleActionFirstAuth]
  // transaction.addAction(sampleActionFirstAuth, true)
  await transaction.generateSerialized()
  await transaction.validate()
  transaction.sign([toEosPrivateKey(env.KYLIN_PROPPROPPROP_PRIVATE_KEY)])
  console.log('missing signatures:', await transaction.missingSignatures)
  console.log('send response:', await transaction.send())

  // add user's signature from encrypted key
  // const ore1qafpgffi_sig = kylin.crypto.decrypt(ore1qafpgffi_privateKeyEncrypted, '2233', ore1qafpgffi_salt)
  // console.log ('ore1qafpgffi_sig:', ore1qafpgffi_sig)
  // transaction.addSignature(ore1qafpgffi_sig)
  // console.log('sign buffer', transaction.signBuffer)

  // ----<
})()