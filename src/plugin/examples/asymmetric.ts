/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// import { Asymmetric } from '../../../crypto'
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

  // asymetric sign test
  // const privKey = '' // for no chain
  // const pubKey = '' // uncompressed
  // const signature = await Asymmetric.sign('sign this string', privKey)
  // console.log('asym sig:', signature)
  // console.log('verify asym sig:', Asymmetric.verifySignedWithPublicKey('sign this string', pubKey, signature as any))

  const publicKey1 = toAlgorandPublicKey('a9f7bdcbc2d11b8f03bdf6cf3eb7d36b9ad53bfe8bdee2e2b5ce39c92a764a45')
  const privateKey1 = toAlgorandPrivateKey(
    'b01282f0b33f6cef6d8937066457168fd1d89992ab75de40e13fff845d5016e1a9f7bdcbc2d11b8f03bdf6cf3eb7d36b9ad53bfe8bdee2e2b5ce39c92a764a45',
  )
  const publicKey2 = toAlgorandPublicKey('a9742a7b9ac9e23d14753a7fbe754e8e5096257892d2327c1e32979b92ae1cb6')
  const privateKey2 = toAlgorandPrivateKey(
    'fc774182bd250473e856cdb993f8f8390c7a5584c30efeffa75e956d37bb13f3a9742a7b9ac9e23d14753a7fbe754e8e5096257892d2327c1e32979b92ae1cb6',
  )

  const message1 = `example payload to encrypt ${new Date().getTime()}`

  const encryptedBlob1 = await algoTest.encryptWithPublicKey(message1, publicKey1)
  console.log('encryptedBlob1:', encryptedBlob1)
  const decryptedText1 = await algoTest.decryptWithPrivateKey(encryptedBlob1, privateKey1)
  console.log('decryptedText1:', decryptedText1)

  // wrap with multiple keys
  const encryptedBlob12 = await algoTest.encryptWithPublicKeys(message1, [publicKey1, publicKey2])
  console.log('encryptedBlob12:', encryptedBlob12)
  const decryptedText12 = await algoTest.decryptWithPrivateKeys(encryptedBlob12, [privateKey1, privateKey2])
  console.log('decryptedText12:', decryptedText12)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
