import { Chain, ChainFactory, ChainType } from '../../src/index'

import { ChainSettings, ChainEndpoint } from '../../src/models/generalModels'

import { ChainEthereumV1 } from '../../src/chains/ethereum_1/ChainEthereumV1'

export const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]

export const sampleTransferTrx = {
  to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
  value: '1000000000',
  gas: 2000000,
  chain: 'ropsten',
  hardfork: 'petersburg',
}
;(async () => {
  try {
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    await ropsten.connect()
    console.log(await ropsten.chainInfo)
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
