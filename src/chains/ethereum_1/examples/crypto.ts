/* eslint-disable new-cap */
/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-escape */
/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../../../index'
import { toEthereumPrivateKey, toEthereumPublicKey } from '../helpers'
import { EthereumChainEndpoint } from '../models'

require('dotenv').config()

// Example client code

const { env } = process

// Chain Settings
const ropstenEndpoints: EthereumChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]

async function run() {

  // Create an EOS chain and call a few functions
  const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
  await ropsten.connect()

  // crypto
  // encrypt/decrypt with password string
  const encrypted1 = ropsten.encryptWithPassword('mystring', 'password', {salt:'mysalt'})
  console.log('encrypted text:', encrypted1)
  const decrypted1 = ropsten.decryptWithPassword(encrypted1, 'password', {salt:'mysalt'})
  console.log('decrypted text:', decrypted1)

  // asymmetric encrypt/decrypt with publicKey/privateKey
  const encrypted2 = await ropsten.encryptWithPublicKey('text to encrypt', toEthereumPublicKey('0x2e438c99bd7ded27ed921919e1d5ee1d9b1528bb8a2f6c974362ad1a9ba7a6f59a452a0e4dfbc178ab5c5c090506bd7f0a6659fd3cf0cc769d6c17216d414163'))
  console.log('encrypted text:', encrypted2)
  const decrypted2 = await ropsten.decryptWithPrivateKey(encrypted2, toEthereumPrivateKey('0x7b0c4bdbc24fd7b6045e9001dbe93f1e46478dedcfcefbc42180ac79fd08ce28'))
  console.log('decrypted text:', decrypted2)

}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
