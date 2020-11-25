/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChainFactory, ChainType } from '../../../index'
import { toAlgorandPrivateKey, toAlgorandPublicKey } from '../helpers'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY
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
  const payload = 'text to encrypt'
  const encryptedBlob = await algoTest.encryptWithPublicKey(
    payload,
    toAlgorandPublicKey('a9f7bdcbc2d11b8f03bdf6cf3eb7d36b9ad53bfe8bdee2e2b5ce39c92a764a45'),
  )
  console.log('encrypted blob:', encryptedBlob)
  const decryptedPayload = await algoTest.decryptWithPrivateKey(
    encryptedBlob,
    toAlgorandPrivateKey(
      'b01282f0b33f6cef6d8937066457168fd1d89992ab75de40e13fff845d5016e1a9f7bdcbc2d11b8f03bdf6cf3eb7d36b9ad53bfe8bdee2e2b5ce39c92a764a45',
    ),
  )
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
