import { ChainFactory, ChainType } from '../../../index'
import { ChainActionType, ChainSettings, ChainEndpoint } from '../../../models'

import { toEthereumPrivateKey, toWei } from '../helpers'
import { EthereumTransactionOptions } from '../models'

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

// EthereumRawTransaction type input for setFromRaw()
// Defaults all optional properties, so you can set from raw just with to & value OR data
export const sampleSetFromRawTrx = {
  to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
  value: toWei(10, 'milliether'),
  //  data: '0x00',
  //  gasPrice: '0x00',
  //  gasLimit: '0x00',
}

export const ropstenTransactionOptions: EthereumTransactionOptions = {
  chain: 'ropsten',
  hardfork: 'istanbul',
}

const composeEthTransferParams = {
  to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
  value: toWei(10, 'milliether'),
}

const composeERC20TransferParams = {
  contract: {
    abi: ABI,
    parameters: ['0xF0109fC8DF283027b6285cc889F5aA624EaC1F55', 100],
    address: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
    method: 'transfer',
  },
}
;(async () => {
  try {
    // // ---> Sign and send ethereum transfer with compose Action
    // const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    // await ropsten.connect()
    // // console.log(await ropsten.chainInfo)
    // const transaction = await ropsten.new.Transaction(ropstenTransactionOptions)
    // // console.log('trx:', transaction)
    // // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [ropsten.composeAction(ChainActionType.TokenTransfer, composeEthTransferParams)]
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(ropstenPrivate)])
    // console.log('SIG: ', transaction.signatures)
    // console.log(await transaction.send())
    //
    // // ---> Sign and send erc20 transfer Transaction
    // const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    // await ropsten.connect()
    // // console.log(await ropsten.chainInfo)
    // const transaction = await ropsten.new.Transaction(sampleTransactionOptions)
    // // console.log('trx:', transaction)
    // // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [ropsten.composeAction(ChainActionType.TokenTransfer, composeERC20TransferParams)]
    // await transaction.prepareToBeSigned()
    // console.log('prepareToBeSigned: ', transaction.actions)
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(ropstenPrivate)])
    //
    // // ---> Sign and send ethereum transfer with setFromRaw()
    //   const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    //   await ropsten.connect()
    //   // console.log(await ropsten.chainInfo)
    //   const transaction = await ropsten.new.Transaction(ropstenTransactionOptions)
    //   // console.log('trx:', transaction)
    //   // await transaction.addAction(sampleTransferTrx)
    //   await transaction.setFromRaw(sampleSetFromRawTrx)
    //   await transaction.validate()
    //   await transaction.sign([toEthereumPrivateKey(ropstenPrivate)])
    //   console.log('SIG: ', transaction.signatures)
    //   console.log(await transaction.send())
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
