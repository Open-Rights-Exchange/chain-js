/* eslint-disable new-cap */
/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-escape */
/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../../../index'
import { toEosPrivateKey, toEosPublicKey } from '../helpers'
import { eosPrivateKeyToEccPrivateKey, eosPublicKeyToEccPublicKey } from '../eosCrypto'

require('dotenv').config()

// Example client code

const { env } = process

// Reusable Settings
const kylinEndpoints = [
  {
    url: new URL('https:api-kylin.eosasia.one:443'),
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
  },
]
const chainSettings = {}

async function run() {

  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV2, kylinEndpoints, chainSettings)
  await kylin.connect()

  // crypto
  // encrypt/decrypt with password string
  const encrypted1 = kylin.encryptWithPassword('mystring', 'password', {salt:'mysalt'})
  console.log('encrypted text:', encrypted1)
  const decrypted1 = kylin.decryptWithPassword(encrypted1, 'password', {salt:'mysalt'})
  console.log('decrypted text:', decrypted1)

  // asymmetric encrypt/decrypt with publicKey/privateKey
  const encrypted2 = await kylin.encryptWithPublicKey('text to encrypt', toEosPublicKey('EOS741pEuhGBr8xrsW1c5rbRfswRkWK89Qz7rM13uUrGA2eJcnGnx'))
  console.log('encrypted text:', encrypted2)
  const decrypted2 = await kylin.decryptWithPrivateKey(encrypted2, toEosPrivateKey('5Je8CkQWxvgJvcxmYWiuSxLnL6nCL21DAysAYxx5Rui4N7bwbPy'))
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
