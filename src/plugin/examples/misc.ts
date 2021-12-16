/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// import { sleep, toChainEntityName } from '../../../helpers'
// import { ChainError, ChainFactory, ChainType } from '../../../index'
import { Models, ChainFactory, Helpers, Errors } from '@open-rights-exchange/chainjs'
import { toAlgorandSymbol } from '../helpers'
import { decryptWithPassword, encryptWithPassword } from '../algoCrypto'
import ChainAlgorandV1 from '../ChainAlgorandV1'


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

  /** get token balance */
  console.log(
    'algo balance:',
    await algoTest.fetchBalance(
      Helpers.toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      toAlgorandSymbol('algo'),
    ),
  )
  await Helpers.sleep(1000) // dont hit chain api again too fast
  console.log(
    'asset balance for ID 10029482:',
    await algoTest.fetchBalance(
      Helpers.toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      toAlgorandSymbol('10029482'),
    ),
  )

  // /** Encrypt and decrypt value using algo crypto function */
  // encryption options can use N:{65536, 131072, 262144, 524288, 1048576}
  const encrypted = encryptWithPassword('somevalue', 'mypassword', { salt: 'mysalt' })
  console.log('encrypted:', encrypted)

  const decrypted = decryptWithPassword(encrypted, 'mypassword', { salt: 'mysalt' })
  console.log('decrypted:', decrypted)

  // map chain error
  try {
    await Helpers.sleep(1000) // dont hit chain api again too fast
    const txResponse = await algoTest.fetchTransaction('IELHXMRB5ZMWZGMRP6PEU2KQQGTRP5AIXBUAYCDWYF7GGC4QWGOQ')
    console.log('txResponse for txId:', txResponse)
    const { algoClient, algoClientIndexer } = algoTest as ChainAlgorandV1
    // const blockInfo = await algoClientIndexer.lookupBlock(99999999999).do() as any
  } catch (error) {
    const chainError = (error as Errors.ChainError)
    console.log(`Chain Error Type: ${chainError.errorType} error:`, error)
  }
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
