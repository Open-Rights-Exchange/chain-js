/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { toPolkadotPrivateKey, toPolkadotPublicKey } from '../helpers'

require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const polkadotMainnetEndpoints = [{
  url: 'wss://rpc.polkadot.io',
}]

async function run() {
  /** Create Algorand chain instance */
  const para = new ChainFactory().create(ChainType.PolkadotV1, polkadotMainnetEndpoints)
  await para.connect()
  if (para.isConnected) {
    console.log('Connected to %o', para.chainId)
  }

  console.log('keyPair:', await para.generateKeyPair())

  const toEncrypt = 'text to encrypt'
  const encryptedBlob = await para.encryptWithPassword(toEncrypt, 'mypassword', {
    salt: 'mysalt',
  })
  console.log('encrypted blob:', encryptedBlob)

  const decryptedPayload = await para.decryptWithPassword(encryptedBlob, 'mypassword', {
    salt: 'mysalt',
  })
  console.log('decrypted payload:', decryptedPayload)

  const publicKey1 = toPolkadotPublicKey(
    '0x2e438c99bd7ded27ed921919e1d5ee1d9b1528bb8a2f6c974362ad1a9ba7a6f59a452a0e4dfbc178ab5c5c090506bd7f0a6659fd3cf0cc769d6c17216d414163',
  )

  const privateKey1 = toPolkadotPrivateKey('0x7b0c4bdbc24fd7b6045e9001dbe93f1e46478dedcfcefbc42180ac79fd08ce28')

  const encrypted2 = await para.encryptWithPublicKey('text to encrypt 2', publicKey1)
  console.log('encrypted text 2:', encrypted2)
  const decrypted2 = await para.decryptWithPrivateKey(encrypted2, privateKey1)
  console.log('decrypted text 2:', decrypted2)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
