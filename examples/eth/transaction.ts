import { Chain, ChainFactory, ChainType } from '../../src/index'

import { ChainSettings, ChainEndpoint } from '../../src/models/generalModels'

import { toEthPrivateKey } from '../../src/chains/ethereum_1/helpers'

export const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]

export const ropstenPrivate = 'f1cf0ee544d6f7b8ac494ade739af347baa3b2c7356a170e866721ce312da895'

export const sampleTransferTrx = {
  to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
  value: '1000000000',
  gas: 2000000,
  chain: 'ropsten',
  hardfork: 'petersburg',
}

export const sampleTransactionAction = {
  to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
  value: '1000000000',
  data: '0x0f',
}
export const sampleTransactionOptions = {
  nonce: '0x00',
  gasPrice: '0x09184e72a000',
  gasLimit: '0x2710',
}
;(async () => {
  try {
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    await ropsten.connect()
    console.log(await ropsten.chainInfo)

    const transaction = await ropsten.new.Transaction(sampleTransactionOptions)
    console.log('trx:', transaction)
    await transaction.addAction(sampleTransferTrx)
    await transaction.generateSerialized()
    console.log('generateSerialized: ', transaction)
    await transaction.validate()
    await transaction.sign([toEthPrivateKey(ropstenPrivate)])
    const signatures = {
      v: transaction?.serialized?.v,
      r: transaction?.serialized?.r,
      s: transaction?.serialized?.s,
    }
    console.log('SIGNATURE', signatures)
  } catch (error) {
    console.log(error)
  }
})()

// console.log(await web3.eth.getBlock('latest'))

// const signedTrx = await web3.eth.accounts.signTransaction(
//   sampleTransferTrx,
//   '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318',
// )
// console.log(signedTrx)
