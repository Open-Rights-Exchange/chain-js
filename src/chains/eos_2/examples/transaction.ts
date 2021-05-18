/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { RpcError } from 'eosjs'
import { Chain, ChainFactory, ChainType } from '../../../index'
import { Asymmetric, AesCrypto } from '../../../crypto'
import { ChainActionType, ConfirmType } from '../../../models'
import { toEosEntityName, toEosPrivateKey, toEosPublicKey, toEosAsset, toEosSymbol } from '../helpers'
import { EosAccount } from '../eosAccount'
import { EosTransaction } from '../eosTransaction'
import { ChainEosV2 } from '../ChainEosV2'

require('dotenv').config()

// Example client code

const prepTransactionFromActions = async (chain: Chain, transactionActions: any, key: string) => {
  console.log('actions:', transactionActions)
  const transaction = (chain as ChainEosV2).new.Transaction()
  transaction.actions = transactionActions
  await transaction.prepareToBeSigned()
  await transaction.validate()
  transaction.sign([key])
  if (transaction.missingSignatures) console.log('missing sigs:', transaction.missingSignatures)
  console.log(JSON.stringify(transaction.toJson()))
  return transaction
}

const { env } = process

// Reusable Settings
const kylinEndpoints = [
  {
    url: 'https:api-kylin.eosasia.one:443',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
  },
  {
    url: 'https://kylin.eos.dfuse.io',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    options: {
      headers: [
        {
          Authorization: 'Bearer ey...',
        },
      ],
    },
  },
]
const oreStagingEndpoints = [
  {
    url: 'https://ore-staging.openrights.exchange/',
    chainId: 'a6df478d5593b4efb1ea20d13ba8a3efc1364ee0bf7dbd85d8d756831c0e3256',
  },
]
const ethEndpoint = {
  url: 'https://main-rpc.linkpool.io/',
}

const chainSettings = { unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma' }

const sampleSerializedTransaction =
  '{"serializedTransaction":{"0":46,"1":143,"2":11,"3":94,"4":147,"5":127,"6":71,"7":23,"8":9,"9":176,"10":0,"11":0,"12":0,"13":0,"14":1,"15":64,"16":99,"17":84,"18":173,"19":86,"20":67,"21":165,"22":74,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":128,"30":107,"31":1,"32":224,"33":214,"34":98,"35":117,"36":25,"37":27,"38":212,"39":165,"40":224,"41":98,"42":173,"43":134,"44":74,"45":149,"46":106,"47":53,"48":8,"49":224,"50":214,"51":98,"52":117,"53":25,"54":27,"55":212,"56":165,"57":0},"signatures":["SIG_K1_K7dahqzaYaZYCqvYFW2jEPMPZS5etQHAbgYu9CTFwvJy7xSzuZ3u7oAuSkrNEo4ZXUMqZpeAmpvqEbd3bfpCHdHHXRGavc"]}'

const sampleSerializedTransaction2 =
  '{"serializedTransaction":{"0":228,"1":27,"2":67,"3":94,"4":3,"5":53,"6":65,"7":218,"8":162,"9":122,"10":0,"11":0,"12":0,"13":0,"14":2,"15":192,"16":233,"17":69,"18":88,"19":169,"20":108,"21":212,"22":69,"23":0,"24":0,"25":0,"26":0,"27":0,"28":192,"29":166,"30":171,"31":1,"32":192,"33":166,"34":75,"35":83,"36":175,"37":228,"38":212,"39":165,"40":0,"41":0,"42":0,"43":0,"44":168,"45":237,"46":50,"47":50,"48":8,"49":160,"50":248,"51":120,"52":132,"53":13,"54":27,"55":212,"56":165,"57":64,"58":99,"59":84,"60":173,"61":86,"62":67,"63":165,"64":74,"65":0,"66":0,"67":0,"68":0,"69":0,"70":0,"71":128,"72":107,"73":1,"74":160,"75":248,"76":120,"77":132,"78":13,"79":27,"80":212,"81":165,"82":224,"83":98,"84":173,"85":134,"86":74,"87":149,"88":106,"89":53,"90":8,"91":160,"92":248,"93":120,"94":132,"95":13,"96":27,"97":212,"98":165,"99":0},"signatures":["SIG_K1_KaEoCVCqiK8BvicHXvEcKAV83AduPNUWxXTknyUGBAUF18tXG1SPQhCApjxPS7xEtxrAVXFFCa8WRPXn2PZ8beG5j5nHSL"]}'

const sampleActionsDemoApp = JSON.parse(
  '{ "account": "demoapphello", "name": "hi", "authorization": [ { "actor": "ore1rnjyxvqp", "permission": "app1qyajfzqr" } ], "data": { "user": "ore1rnjyxvqp" } }',
  // '{"account":"demoapphello","name":"hi","authorization":[{"actor":"ore1qctfkfhw","permission":"appdemoappli"}],"data":{"user":"ore1qctfkfhw"}}',
)
const sampleActionFirstAuth = JSON.parse(
  '{"account":"createescrow","name":"ping","authorization":[{"actor":"ore1rmpfgqqo","permission":"active"}],"data":{"from":"ore1rmpfgqqo"}}',
  // '{"account":"createbridge","name":"ping","authorization":[{"actor":"oreidfunding","permission":"active"}],"data":{"from":"oreidfunding"}}',
)
const sampleActionData_UpdateAuthSetActiveToUnused = JSON.parse(
  '{"account":"eosio","name":"updateauth","authorization":[{"actor":"ore1qadesjxm","permission":"owner"}],"data":{"account":"ore1qadesjxm","permission":"active","parent":"owner","auth":{"accounts":[],"keys":[{"key":"EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma","weight":1}],"threshold":1,"waits":[]}}}',
)
const { serializedTransaction, signatures } = JSON.parse(sampleSerializedTransaction)

// privateKeyEncryptionMethod salt - eks0
const ore1qctfkfhw_privateKeyEncrypted = AesCrypto.toAesEncryptedDataString(
  '{"iv":"hc3XuKumuzYchpF2Rfa5bw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","salt":"gZ3SFYyR6ZU=","ct":"/0dtw1W3L2fekTZl5/mQ6Ulx7acSHZ0GOfv3vvdE8OgwuRD9KwsWKJbQhKizwsQoMyoyGiIXsXasB7o="}',
)
const ore1qctfkfhw_salt = env.EOS_KYLIN_PW_SALT_V0

const transferTokenOptions = {
  contractName: toEosEntityName('eosio.token'),
  fromAccountName: toEosEntityName('proppropprop'),
  toAccountName: toEosEntityName('oreidfunding'),
  amount: '0.0001',
  // amount: '1.1',  // OR use precision param
  // precision: 4,
  symbol: toEosSymbol('EOS'),
  memo: 'memo',
  permission: toEosEntityName('active'),
}

async function run() {
  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV2, kylinEndpoints, chainSettings)
  await kylin.connect()

  //  ---> set transaction from serialized
  // const transaction = kylin.new.Transaction({ blocksBehind: 10 })
  // await transaction.setFromRaw(serializedTransaction)
  // await transaction.validate()
  // console.log('missing signatures:', transaction.missingSignatures)
  // transaction.signatures = signatures
  // await transaction.validate()

  // console.log('hasAllRequiredSignatures:', transaction.hasAllRequiredSignatures)
  // console.log('actions:', JSON.stringify(transaction.actions))
  // console.log('header:', transaction.header)
  // console.log('signatures:', transaction.signatures)
  // ----<

  // ---> set transaction from actions
  // const transaction = kylin.new.Transaction()
  // transaction.actions = [sampleActionFirstAuth]
  // // transaction.addAction(sampleActionFirstAuth, true)
  // await transaction.prepareToBeSigned()
  // await transaction.validate()
  // await transaction.sign([toEosPrivateKey(env.KYLIN_proppropprop_PRIVATE_KEY)])
  // console.log('missing signatures:', transaction.missingSignatures)
  // const txResponse = await transaction.send()
  // console.log('send response:', JSON.stringify(txResponse))

  // ---> send token
  const transaction = kylin.new.Transaction()
  // transaction.actions = [await kylin.composeAction(ChainActionType.TokenTransfer, transferTokenOptions)]
  transaction.actions = [sampleActionsDemoApp]
  transaction.addAction(sampleActionFirstAuth, true)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  // await transaction.sign([toEosPrivateKey(env.EOS_KYLIN_OREIDFUNDING_PRIVATE_KEY)])
  // await transaction.sign([toEosPrivateKey(env.KYLIN_proppropprop_PRIVATE_KEY)])
  await transaction.sign([toEosPrivateKey('5KADGFLxMNNB3PGWo6eUCTeSFoJMCBzMoJCxtaWH4oPYcgb2THR')])
  await transaction.sign([toEosPrivateKey('5JYCyY6girNbvKNxaXJqHuzEZp9kBSK7vfquE17vVqTTjkjrCFT')])
  console.log(JSON.stringify(transaction.actions))
  console.log(transaction.raw)
  console.log(transaction.signatures)
  console.log('missing signatures:', await transaction.missingSignatures)
  const txResponse = await transaction.send(ConfirmType.After001)
  console.log('send response:', JSON.stringify(txResponse))
  console.log('transactionId: ', transaction.transactionId)
  // ----<

  // ---> demo transaction
  // const transaction = kylin.new.Transaction()
  // transaction.actions = [sampleActionsDemoApp]
  // // transaction.addAction(sampleActionFirstAuth, true)
  // await transaction.prepareToBeSigned()
  // await transaction.validate()
  // await transaction.sign([toEosPrivateKey(env.KYLIN_proppropprop_PRIVATE_KEY)])
  // console.log('missing signatures:', transaction.missingSignatures)
  // // add user's signature from encrypted key
  // const ore1qctfkfhw_sig = kylin.toPrivateKey(
  //   kylin.decryptWithPassword(ore1qctfkfhw_privateKeyEncrypted, '2233', { salt: ore1qctfkfhw_salt }),
  // )
  // console.log('ore1qctfkfhw_sig:', ore1qctfkfhw_sig)
  // await transaction.sign([ore1qctfkfhw_sig])
  // console.log('sign buffer', transaction.signBuffer)
  // const txResponse = await transaction.send()
  // console.log('id: ', transaction.transactionId)
  // console.log('send response:', JSON.stringify(txResponse))
  // ----<
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
