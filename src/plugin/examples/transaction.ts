/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

// import { ChainFactory, ChainType } from '../../../index'
// import { ChainEndpoint, ChainActionType, TxExecutionPriority, ConfirmType } from '../../../models'
import { Models, ChainFactory, Helpers } from '@open-rights-exchange/chainjs'
import { AlgorandAddress, AlgorandUnit, AlgorandValue } from '../models'
import { toAlgorandPrivateKey } from '../helpers'
import { AlgorandTransaction } from '../algoTransaction'
import { AlgorandChainState } from '../algoChainState'
import ChainAlgorandV1 from '../ChainAlgorandV1'
// import { jsonParseAndRevive, sleep } from '../../../helpers'


require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [
  {
    url: 'https://mainnet-algorand.api.purestake.io/ps2',
    options: { indexerUrl: 'https://mainnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
  },
]
const algoTestnetEndpoints = [
  {
    url: 'https://testnet-algorand.api.purestake.io/ps2',
    options: { indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
  },
]
const algoBetanetEndpoints = [
  {
    url: 'https://betanet-algorand.api.purestake.io/ps2',
    options: { indexerUrl: 'https://betanet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
  },
]

interface valueTransferParams {
  fromAccountName?: AlgorandAddress
  toAccountName: AlgorandAddress
  amount: number
  symbol?: AlgorandUnit
  memo: AlgorandValue
}

const composeValueTransferParams: valueTransferParams = {
  fromAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  toAccountName: 'GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A',
  amount: 1000000,
  symbol: AlgorandUnit.Microalgo,
  memo: 'Hello World',
}

const rawTransaction = // has serialized Buffers
  '{"txn":{"amt":1,"fee":1000,"fv":12552955,"lv":12553955,"note":{"type":"Buffer","data":[174,83,97,109,112,108,101,32,112,97,121,109,101,110,116]},"snd":{"type":"Buffer","data":[50,233,108,32,251,215,163,12,235,155,51,32,227,133,22,178,236,50,125,181,113,142,2,115,133,117,199,201,228,230,235,93]},"type":"pay","gen":"testnet-v1.0","gh":{"type":"Buffer","data":[72,99,181,24,164,179,200,78,200,16,242,45,79,16,129,203,15,113,240,89,167,172,32,222,198,47,127,112,229,9,58,34]},"rcv":{"type":"Buffer","data":[168,101,164,68,116,110,137,242,164,216,34,161,122,2,23,221,236,191,81,161,78,114,147,135,226,72,217,99,209,87,1,164]}}}'

const rawTransactionType2 = // has serialized UInt8Array
  '{"msig":{"subsig":[{"pk":{"0":2,"1":209,"2":85,"3":60,"4":195,"5":63,"6":169,"7":76,"8":163,"9":134,"10":39,"11":119,"12":108,"13":40,"14":16,"15":89,"16":233,"17":29,"18":14,"19":226,"20":210,"21":137,"22":104,"23":15,"24":192,"25":4,"26":124,"27":181,"28":222,"29":112,"30":3,"31":11}},{"pk":{"0":16,"1":151,"2":244,"3":8,"4":87,"5":127,"6":159,"7":29,"8":10,"9":208,"10":0,"11":69,"12":254,"13":101,"14":168,"15":97,"16":4,"17":154,"18":102,"19":67,"20":20,"21":4,"22":251,"23":193,"24":200,"25":51,"26":244,"27":224,"28":45,"29":89,"30":105,"31":32},"s":{"0":20,"1":179,"2":147,"3":70,"4":1,"5":42,"6":191,"7":22,"8":107,"9":249,"10":96,"11":119,"12":62,"13":81,"14":28,"15":109,"16":233,"17":233,"18":47,"19":15,"20":29,"21":83,"22":250,"23":98,"24":120,"25":11,"26":57,"27":39,"28":78,"29":90,"30":228,"31":131,"32":149,"33":86,"34":168,"35":30,"36":32,"37":189,"38":38,"39":27,"40":154,"41":47,"42":184,"43":175,"44":139,"45":93,"46":106,"47":126,"48":44,"49":155,"50":230,"51":92,"52":18,"53":140,"54":90,"55":188,"56":30,"57":59,"58":253,"59":32,"60":37,"61":221,"62":166,"63":9}},{"pk":{"0":135,"1":171,"2":50,"3":212,"4":174,"5":7,"6":230,"7":16,"8":119,"9":225,"10":233,"11":18,"12":5,"13":111,"14":62,"15":88,"16":92,"17":30,"18":213,"19":59,"20":29,"21":38,"22":14,"23":237,"24":164,"25":232,"26":179,"27":225,"28":77,"29":155,"30":125,"31":234}}],"thr":2,"v":1},"txn":{"amt":4,"fee":1000,"fv":12632873,"gen":"testnet-v1.0","gh":{"0":72,"1":99,"2":181,"3":24,"4":164,"5":179,"6":200,"7":78,"8":200,"9":16,"10":242,"11":45,"12":79,"13":16,"14":129,"15":203,"16":15,"17":113,"18":240,"19":89,"20":167,"21":172,"22":32,"23":222,"24":198,"25":47,"26":127,"27":112,"28":229,"29":9,"30":58,"31":34},"lv":12633873,"note":{"0":174,"1":83,"2":97,"3":109,"4":112,"5":108,"6":101,"7":32,"8":112,"9":97,"10":121,"11":109,"12":101,"13":110,"14":116},"rcv":{"0":168,"1":101,"2":164,"3":68,"4":116,"5":110,"6":137,"7":242,"8":164,"9":216,"10":34,"11":161,"12":122,"13":2,"14":23,"15":221,"16":236,"17":191,"18":81,"19":161,"20":78,"21":114,"22":147,"23":135,"24":226,"25":72,"26":217,"27":99,"28":209,"29":87,"30":1,"31":164},"snd":{"0":184,"1":157,"2":155,"3":116,"4":170,"5":197,"6":117,"7":237,"8":96,"9":149,"10":154,"11":209,"12":171,"13":83,"14":117,"15":96,"16":218,"17":54,"18":236,"19":226,"20":95,"21":9,"22":228,"23":171,"24":83,"25":70,"26":131,"27":184,"28":46,"29":120,"30":31,"31":210},"type":"pay"}}'

async function run() {
  /** Create Algorand chain instance */
  const chainSettings = { defaultTransactionSettings: { expireSeconds: 100 } } // optional setting
  const algoTest = new ChainFactory().create(Models.ChainType.AlgorandV1, algoTestnetEndpoints, chainSettings)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }
  /** Compose and send transaction */
  const transaction = await algoTest.new.Transaction()
  // await transaction.setTransaction(jsonParseAndRevive(rawTransaction))
  const action = await algoTest.composeAction(Models.ChainActionType.ValueTransfer, composeValueTransferParams)
  transaction.actions = [action]
  // transaction.setTransaction(action)
  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = await algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)
  const suggestedFee = await transaction.getSuggestedFee(Models.TxExecutionPriority.Average)
  console.log('suggestedFee: ', suggestedFee)
  await transaction.setDesiredFee(suggestedFee)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  console.log('missing signatures: ', transaction.missingSignatures)
  try {
    console.log('send response: %o', JSON.stringify(await transaction.send(Models.ConfirmType.None)))
    // console.log('send response: %o', JSON.stringify(await transaction.send(ConfirmType.After001)))
    // console.log('actual fee: ', await transaction.getActualCost()) // will throw if tx not yet on-chain e.g. If transaction.send uses ConfirmType.None
  } catch (err) {
    console.log(err)
  }
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
