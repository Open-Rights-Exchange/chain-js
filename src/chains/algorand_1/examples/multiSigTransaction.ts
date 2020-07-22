/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint, ChainActionType } from '../../../models'
import { AlgorandAddress, AlgorandUnit, AlgorandValue, AlgorandMultiSigOptions } from '../models'
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

export const CreateAccountOptions = {
  newKeysOptions: {
    password: '2233',
  },
}

export const multiSigOptions: AlgorandMultiSigOptions = {
  version: 1,
  threshold: 2,
  addrs: [
    env.ALGOTESTNET_mulitsig_child_account1,
    env.ALGOTESTNET_mulitsig_child_account2,
    env.ALGOTESTNET_mulitsig_child_account3,
  ],
}

export const CreateMultiSigAccountOptions = {
  ...CreateAccountOptions,
  multiSigOptions,
}

interface valueTransferParams {
  fromAccountName?: AlgorandAddress
  toAccountName: AlgorandAddress
  amount: number
  symbol?: AlgorandUnit
  memo: AlgorandValue
}

const composeValueTransferParams: valueTransferParams = {
  toAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
  amount: 1000000,
  symbol: AlgorandUnit.Microalgo,
  memo: 'Hello World',
}
;(async () => {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoPureStakeTestnet)
  }

  /** Create Algorand multisig account */
  const createMultiSigAccount = algoTest.new.CreateAccount(CreateMultiSigAccountOptions)
  await createMultiSigAccount.generateKeysIfNeeded()
  const { accountName: multiSigAccountName } = createMultiSigAccount
  console.log('mulitsig account: %o', multiSigAccountName)

  const transaction = await algoTest.new.Transaction({ multiSigOptions })
  composeValueTransferParams.fromAccountName = multiSigAccountName
  const action = await algoTest.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)
  transaction.actions = [action]
  console.log('transaction actions: ', transaction.actions[0])
  const decomposed = algoTest.decomposeAction(transaction.actions[0])
  console.log('decomposed actions: ', decomposed)

  await transaction.prepareToBeSigned()
  await transaction.validate()

  await transaction.sign([
    toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY),
    toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY),
  ])
  console.log('missing signatures: ', transaction.missingSignatures)
  console.log('send response: %o', JSON.stringify(await transaction.send()))
})()
