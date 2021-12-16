/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// import { ChainFactory, ChainType } from '../../../index'
import { Models, ChainFactory, Helpers } from '@open-rights-exchange/chainjs'
import { toAlgorandPrivateKey, toAlgorandPublicKey } from '../helpers'


require('dotenv').config()

const { env } = process

const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
const algoMainnetEndpoints = [{
  url: 'https://mainnet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://mainnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoTestnetEndpoints = [ {
  url: 'https://testnet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]
const algoBetanetEndpoints = [{
  url: 'https://betanet-algorand.api.purestake.io/ps2',
  options: { indexerUrl: 'https://betanet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
}]

async function run() {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(Models.ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoTest.chainId)
  }
  console.log('keyPair:', await algoTest.generateKeyPair())

  // Test symmetric encryption (with a password)
  const toEncrypt = 'text to encrypt'
  const encryptedBlob = await algoTest.encryptWithPassword(toEncrypt, 'mypassword', {
    salt: 'mysalt',
    N: 65536,
  })
  console.log('encrypted blob:', encryptedBlob)

  const decryptedPayload = await algoTest.decryptWithPassword(encryptedBlob, 'mypassword', {
    salt: 'mysalt',
    N: 65536,
  })
  console.log('decrypted payload:', decryptedPayload)

  // Test asymmetric encryption (with a public/private key pair)
  const toEncryptAsymString = 'text to encrypt'
  const publicKey = 'a41306d9d3c047f31d04110cbc58e1c5c37018caabdeda53533636fe7b06c256'
  const privateKey = 'b911137ecf59d4f917801ccc0bb365ae866d381c2f7961bbbafa2a7e08bac884a41306d9d3c047f31d04110cbc58e1c5c37018caabdeda53533636fe7b06c256'

  const encryptedAsymBlob = await algoTest.encryptWithPublicKey(toEncryptAsymString, publicKey)
  console.log('encrypted blob:', encryptedAsymBlob)

  const decryptedAsymPayload = await algoTest.decryptWithPrivateKey(encryptedAsymBlob, privateKey)
  console.log('decrypted payload:', decryptedAsymPayload)

}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
