/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { toChainEntityName } from '../../../helpers'
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models'
import { AlgorandMultiSigOptions } from '../models/generalModels'
import { toAlgorandSymbol } from '../helpers/generalModelHelpers'

require('dotenv').config()

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
  accounts: [
    'LE6IM6NPZ7DPF3LTVQT62ARING2VSXO7KOYFHCUCNXKSQLVW4I3AKXUMPI',
    'S4N2Q4H3ZDZHR7OL6C7FLXI76K7W5XTPFNOXHOSUPL7GPMXU4PT4XCHXLE',
    'O24FOKUAML2OB3KLQXWIZ2S4VFTEMO6E2PZFYBDT6HX22C5O7DCRHUIUWU',
  ],
}

export const CreateMultiSigAccountOptions = {
  ...CreateAccountOptions,
  multiSigOptions,
}

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoPureStakeTestnet)
  }

  /** get token balance */
  console.log(
    'get token balance:',
    await algoTest.fetchBalance(
      toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      toAlgorandSymbol('algo'),
    ),
  )
  console.log(
    'get asset balance for ID :',
    await algoTest.fetchBalance(
      toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      toAlgorandSymbol('10029482'),
    ),
  )
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
