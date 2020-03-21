import { ChainFactory, ChainType } from '../../src/index'
import { ChainActionType, ChainSettings, ChainEndpoint } from '../../src/models'

import { toEthereumPrivateKey, toWei } from '../../src/chains/ethereum_1/helpers'
import { EthereumTransactionOptions } from '../../src/chains/ethereum_1/models'

export const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]
const ABI = [
  {
    constant: false,
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getBalance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

export const ropstenPrivate = 'a5490e49ea693fe6dd5997a75a2c8d4231b1a9545b82326322343ca2a1facfb4'

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
export const ropstenTransactionOptions: EthereumTransactionOptions = {
  chain: 'ropsten',
  hardfork: 'istanbul',
}
const transferEthOptions = {
  to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
  value: toWei(10, 'milliether'),
}

const transferErc20Options = {
  contract: {
    abi: ABI,
    parameters: ['0xF0109fC8DF283027b6285cc889F5aA624EaC1F55', 100],
    address: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
    method: 'transfer',
  },
}
;(async () => {
  try {
    // ---> Sign and send ethereum transfer transaction
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    await ropsten.connect()
    // console.log(await ropsten.chainInfo)
    const transaction = await ropsten.new.Transaction(ropstenTransactionOptions)
    // console.log('trx:', transaction)
    // await transaction.addAction(sampleTransferTrx)
    transaction.actions = [ropsten.composeAction(ChainActionType.TokenTransfer, transferEthOptions)]
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.sign([toEthereumPrivateKey(ropstenPrivate)])
    console.log('SIG: ', transaction.signatures)
    console.log(await transaction.send())
    // // ---> Sign and send erc20 transfer Transaction
    // const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    // await ropsten.connect()
    // // console.log(await ropsten.chainInfo)
    // const transaction = await ropsten.new.Transaction(sampleTransactionOptions)
    // // console.log('trx:', transaction)
    // // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [ropsten.composeAction(ChainActionType.TokenTransfer, transferErc20Options)]
    // await transaction.prepareToBeSigned()
    // console.log('prepareToBeSigned: ', transaction.actions)
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(ropstenPrivate)])
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
