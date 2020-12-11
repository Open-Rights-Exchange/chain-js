/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { toChainEntityName } from '../../../helpers'
import { ChainError, ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models'
import { toAlgorandSymbol } from '../helpers'
import { decryptWithPassword, encryptWithPassword } from '../algoCrypto'
import { ChainAlgorandV1 } from '../ChainAlgorandV1'
import { mapChainError } from '../algoErrors'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [
  {
    url: new URL('https://mainnet-algorand.api.purestake.io/ps1'),
    options: { headers: [{ 'X-API-Key': algoApiKey }] },
  },
]
const algoTestnetEndpoints = [
  {
    url: new URL('https://testnet-algorand.api.purestake.io/ps1'),
    options: { headers: [{ 'X-API-Key': algoApiKey }] },
  },
]
const algoBetanetEndpoints = [
  {
    url: new URL('https://betanet-algorand.api.purestake.io/ps1'),
    options: { headers: [{ 'X-API-Key': algoApiKey }] },
  },
]

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
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
    'get asset balance for ID 10029482:',
    await algoTest.fetchBalance(
      toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      toAlgorandSymbol('10029482'),
    ),
  )

  /** Encrypt and decrypt value using algo crypto function */
  // encryption options can use N:{65536, 131072, 262144, 524288, 1048576}
  const encrypted = encryptWithPassword('somevalue', 'mypassword', { salt: 'mysalt' })
  console.log('encrypted:', encrypted)

  const decrypted = decryptWithPassword(encrypted, 'mypassword', { salt: 'mysalt' })
  console.log('decrypted:', decrypted)

  // map chain error
  try {
    const { algoClient } = algoTest as ChainAlgorandV1
    const { timestamp } = await algoClient.block(99999999999)
  } catch (error) {
    const chainError = mapChainError(error)
    console.log('Chain Error Type:', chainError.errorType)

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
