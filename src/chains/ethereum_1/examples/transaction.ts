/* eslint-disable @typescript-eslint/no-unused-vars */
import Web3 from 'web3'
import { ChainFactory, ChainType } from '../../../index'
import { ChainActionType, ChainSettings, ChainEndpoint, ChainForkType } from '../../../models'

import { toEthereumPrivateKey, toWei, toEthUnit } from '../helpers'
import { EthereumTransactionOptions, EthUnit } from '../models'

const web3 = new Web3('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a')

export const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]
const ABI: any[] = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const ropstenPrivate = '12a1a5e255f23853aeac0581e7e5615433de9817cc5a455c8230bd4f91a03bbb'

// EthereumRawTransaction type input for setFromRaw()
// Defaults all optional properties, so you can set from raw just with to & value OR data
export const sampleSetFromRawTrx = {
  to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
  value: toWei(10, EthUnit.Milliether),
  //  data: '0x00',
  //  gasPrice: '0x00',
  //  gasLimit: '0x00',
}

export const ropstenTransactionOptions: ChainForkType = {
  chainName: 'ropsten',
  hardFork: 'istanbul',
}

const composeEthTransferParams = {
  to: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
  value: toWei(10, toEthUnit('milliether')),
}

const composeERC20TransferParams = {
  to: '0x04825941Ad80A6a869e85606b29c9D25144E91e6',
  contract: {
    abi: ABI,
    parameters: ['0x27105356F6C1ede0e92020e6225E46DC1F496b81', 20], // 0xD38ADf7D0204a6f5b7ddDe509378e43B1447CDb6
    method: 'transfer',
  },
}

const composeERC20MintParams = {
  from: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
  to: '0x04825941Ad80A6a869e85606b29c9D25144E91e6',
  contract: {
    abi: ABI,
    parameters: [20],
    method: 'mint',
  },
}
;(async () => {
  try {
    // // ---> Sign and send ethereum transfer with compose Action
    // const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    // await ropsten.connect()
    // // console.log(await ropsten.chainInfo)
    // //const transaction = await ropsten.new.Transaction(ropstenTransactionOptions)
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
    // const transaction = await ropsten.new.Transaction(ropstenTransactionOptions)
    // // console.log('trx:', transaction)
    // // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [ropsten.composeAction(ChainActionType.TokenTransfer, composeERC20TransferParams)]
    // await transaction.prepareToBeSigned()
    // console.log('prepareToBeSigned: ', transaction.actions)
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(ropstenPrivate)])
    // console.log('SIG: ', transaction.signatures)
    // console.log(await transaction.send())
    //
    // ---> Sign and send erc20 mint Transaction
    // const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {
    //   chainForkType: ropstenTransactionOptions,
    // } as ChainSettings)
    // await ropsten.connect()
    // // console.log(await ropsten.chainInfo)
    // const transaction = await ropsten.new.Transaction({})
    // // console.log('trx:', transaction)
    // // await transaction.addAction(sampleTransferTrx)
    // transaction.actions = [ropsten.composeAction(ChainActionType.TokenTransfer, composeERC20MintParams)]
    // await transaction.prepareToBeSigned()
    // console.log('prepareToBeSigned: ', transaction.actions)
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(ropstenPrivate)])
    // console.log(transaction.requiredAuthorizations)
    // console.log('SIG: ', transaction.signatures)
    // console.log(transaction.missingSignatures)
    // console.log(await transaction.send())
    // // ---> Sign and send ethereum transfer with setFromRaw()
    //
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
