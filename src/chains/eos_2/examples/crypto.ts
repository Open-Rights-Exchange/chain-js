/* eslint-disable new-cap */
/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-escape */
/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../../../index'
import { Asymmetric, Symmetric } from '../../../crypto'
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

const publicKey1 = toEosPublicKey('EOS741pEuhGBr8xrsW1c5rbRfswRkWK89Qz7rM13uUrGA2eJcnGnx')
const privateKey1 = toEosPrivateKey('5Je8CkQWxvgJvcxmYWiuSxLnL6nCL21DAysAYxx5Rui4N7bwbPy')
const publicKey2 = toEosPublicKey('EOS6YdAbt4EZddixhtD4aZtpv9sDsSWRiWTptkCTbjaEZ3QaujK93')
const privateKey2 = toEosPrivateKey('5JuS5NoPKWBkriHNwLiRrsA2SDsv6ogSBdnCTu8v5EkYpNQjArM')

async function run() {
  // Create an EOS chain and call a few functions
  const kylin = new ChainFactory().create(ChainType.EosV2, kylinEndpoints, chainSettings)
  await kylin.connect()

  console.log('keyPair:', await kylin.generateKeyPair())

  // crypto
  // encrypt/decrypt with password string
  const encrypted1 = kylin.encryptWithPassword('mystring', '2233', { salt: 'us62bn 2l0df5j' })
  const decrypted1 = kylin.decryptWithPassword(encrypted1, '2233', { salt: 'us62bn 2l0df5j' })

  console.log('encrypted text:', encrypted1)
  // const decrypted1 = kylin.decryptWithPassword(encrypted1, 'password', {salt:'mysalt'})
  console.log('decrypted text:', decrypted1)

  // asymmetric encrypt/decrypt with publicKey/privateKey
  const encrypted2 = await kylin.encryptWithPublicKey('text to encrypt 2', publicKey1)
  console.log('encrypted text 2:', encrypted2)
  const decrypted2 = await kylin.decryptWithPrivateKey(encrypted2, privateKey1)
  console.log('decrypted text 2:', decrypted2)

  // asymmetric encrypt/decrypt wrapping MULTIPLE publicKey/privateKey pairs - wapped with multiple keys
  const encrypted3 = await kylin.encryptWithPublicKeys('text to encrypt 3', [publicKey1, publicKey2])
  console.log('encrypted text 3:', encrypted3)
  const decrypted3 = await kylin.decryptWithPrivateKeys(encrypted3, [privateKey1, privateKey2])
  console.log('decrypted asymmetric text:', decrypted3)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
