/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint, ChainActionType, TokenTransferParams } from '../../../models'
import { AlgorandActionAssetTransferParams, AlgorandChainActionType } from '../models'
import { toAlgorandPrivateKey } from '../helpers'

require('dotenv').config()

const { env } = process

const algoPureStakeTestnet = 'https://testnet-algorand.api.purestake.io/ps1'

export const algoTestnetEndpoints: ChainEndpoint[] = [
  {
    url: new URL(algoPureStakeTestnet),
    options: {
      headers: [
        {
          'X-API-Key': '7n0G2itKl885HQQzEfwtn4SSE1b6X3nb6zVnUw99',
        },
      ],
    },
  },
]

const composeTokenTransferParams: Partial<AlgorandActionAssetTransferParams> = {
  from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  to: 'TF6PJW7VSEKD5AXYMUXF5YGMPDUWBJQRHH4PYJISFPXAMI27PGYHKLALDY',
  note: 'hello world',
  amount: 1,
  assetIndex: 10820019,
}
;(async () => {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoPureStakeTestnet)
  }

  /** Compose and send transaction */
  const transaction = await algoTest.new.Transaction()
  const action = await algoTest.composeAction(AlgorandChainActionType.AssetTransfer, composeTokenTransferParams)
  console.log('action:', action)
  transaction.actions = [action]
  const decomposed = algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed action: ', decomposed)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  console.log('required signatures (before signing): ', transaction.missingSignatures)
  await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])
  console.log('send response: %o', JSON.stringify(await transaction.send()))
})()
