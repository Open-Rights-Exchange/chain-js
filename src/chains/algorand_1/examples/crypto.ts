/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChainFactory, ChainType } from '../../../index'
import { toAlgorandPrivateKey, toAlgorandPublicKey } from '../helpers'

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

  console.log('keyPair:', await algoTest.generateKeyPair())

  const payload = 'text to encrypt'
  const encryptedBlob = await algoTest.encryptWithPassword(payload, 'mypassword', {
    salt: 'mysalt',
  })
  console.log('encrypted blob:', encryptedBlob)

  const decryptedPayload = await algoTest.decryptWithPassword(encryptedBlob, 'mypassword', {
    salt: 'mysalt',
  })
  console.log('decrypted payload:', decryptedPayload)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
