/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { toAlgorandPrivateKey, toAlgorandPublicKey } from '../helpers'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [{
  url: new URL('https://mainnet-algorand.api.purestake.io/ps2'),
  indexerUrl: new URL('https://mainnet-algorand.api.purestake.io/idx2'),
  options: { headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoTestnetEndpoints = [ {
  url: new URL('https://testnet-algorand.api.purestake.io/ps2'),
  indexerUrl: new URL('https://testnet-algorand.api.purestake.io/idx2'),
  options: { headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoBetanetEndpoints = [{
  url: new URL('https://betanet-algorand.api.purestake.io/ps2'),
  indexerUrl: new URL('https://betanet-algorand.api.purestake.io/idx2'),
  options: { headers: [{ 'x-api-key': algoApiKey }] },
}]

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }

  console.log('keyPair:', await algoTest.generateKeyPair())

  const toEncrypt = 'text to encrypt'
  const encryptedBlob = await algoTest.encryptWithPassword(toEncrypt, 'mypassword', {
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
