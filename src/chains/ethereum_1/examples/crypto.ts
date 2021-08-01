/* eslint-disable new-cap */
/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-escape */
/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Chain, ChainFactory, ChainType } from '../../../index'
import { toEthereumPrivateKey, toEthereumPublicKey, toEthereumSignatureNative } from '../helpers'
import { uncompressPublicKey, prepareMessageToSign, verifySignedMessage, signMessage, getEthereumPublicKeyFromSignature} from '../ethCrypto'
import { EthereumChainEndpoint } from '../models'

require('dotenv').config()

// Example client code

const { env } = process

// Chain Settings
const ropstenEndpoints: EthereumChainEndpoint[] = [
  {
    url: 'https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
  },
]

async function run() {
  // Create an EOS chain and call a few functions
  const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
  await ropsten.connect()

  // crypto

  const keyPair = await ropsten.generateKeyPair()
  console.log('keyPair:', keyPair)
  console.log('uncompressed publicKey:', uncompressPublicKey(keyPair.publicKey))

  // encrypt/decrypt with password string
  const encrypted1 = ropsten.encryptWithPassword('mystring', 'password', { salt: 'mysalt' })
  console.log('encrypted text 1:', encrypted1)
  const decrypted1 = ropsten.decryptWithPassword(encrypted1, 'password', { salt: 'mysalt' })
  console.log('decrypted text 1:', decrypted1)

  const publicKey1 = toEthereumPublicKey(
    '0x2e438c99bd7ded27ed921919e1d5ee1d9b1528bb8a2f6c974362ad1a9ba7a6f59a452a0e4dfbc178ab5c5c090506bd7f0a6659fd3cf0cc769d6c17216d414163',
  )
  const privateKey1 = toEthereumPrivateKey('0x7b0c4bdbc24fd7b6045e9001dbe93f1e46478dedcfcefbc42180ac79fd08ce28')

  const publicKey2 = toEthereumPublicKey(
    '0x684548e52f131dbe0fe411d9740f598dc124274bfda14a0150e0ec9f7f327fa0db2d7a16fd8e6ab2d0ed025424d6c64023492b8a0bedcc0d09f84e34dfa81687',
  )
  const privateKey2 = toEthereumPrivateKey('0x6a75b844119c88ee66fd904cfb9b18a8d318beb9a5ac278b1a95a81e86b17400')

  const publicKey3 = toEthereumPublicKey(
    '0x93dba0cc5c6e72c138a8a4008f520480cb49b90b0b513beab8b8a1b7f702bda50135135088e1389e4d17470e4a1f8f12de1ae1e7ecfe237a87e9bcf2d78dfdde',
  )
  const privateKey3 = toEthereumPrivateKey('0xa0da3da38055e1a092bae2b7e18c26445feeab870d8ad8231c34275ebe3129b5')

  // asymmetric encrypt/decrypt with a SINGLE publicKey/privateKey
  const encrypted2 = await ropsten.encryptWithPublicKey('text to encrypt 2', publicKey1)
  console.log('encrypted text 2:', encrypted2)
  const decrypted2 = await ropsten.decryptWithPrivateKey(encrypted2, privateKey1)
  console.log('decrypted text 2:', decrypted2)

  // asymmetric encrypt/decrypt wrapping MULTIPLE publicKey/privateKey pairs - wapped with multiple keys
  // s1 (and s2) are optional additional secrets (think password) that must be the same for encrypt and decrypt
  const encrypted3 = await ropsten.encryptWithPublicKeys('text to encrypt 3', [publicKey1, publicKey2, publicKey3], {s1:'abc'})
  console.log('encrypted text 3:', encrypted3)
  const decrypted3 = await ropsten.decryptWithPrivateKeys(encrypted3, [privateKey1, privateKey2, privateKey3], {s1:'abc'})
  console.log('decrypted asymmetric text 3:', decrypted3)

  // sign a message (akak string) and verify signature
  const message = 'Hello from chainjs'
  const stringSignature = signMessage(message, privateKey1)
  console.log('signature is verified: ', verifySignedMessage(message, publicKey1, stringSignature))
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
