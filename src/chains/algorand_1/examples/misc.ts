/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { toChainEntityName } from '../../../helpers'
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models'
import { toAlgorandSymbol } from '../helpers'
import { decrypt, encrypt } from '../algoCrypto'

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

  /** Encrypt and decrypt value using algo crypto function */
  const encrypted = await encrypt('somevalue', 'mypassword', { salt: 'mysalt' })
  console.log('encrypted:', encrypted)

  const decrypted = await decrypt('somevalue', 'mypassword', { salt: 'mysalt' })
  console.log('decrypted:', decrypted)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
