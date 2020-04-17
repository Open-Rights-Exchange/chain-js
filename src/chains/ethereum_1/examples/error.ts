/* eslint-disable @typescript-eslint/no-unused-vars */
import Web3 from 'web3'
import { Transaction as EthereumJsTx } from 'ethereumjs-tx'
import { toWei, addPrefixToHex, toEthBuffer } from '../helpers'
import { EthUnit } from '../models'

const web3 = new Web3('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a')

export const ropstenPrivate = '12a1a5e255f23853aeac0581e7e5615433de9817cc5a455c8230bd4f91a03bbb'
export const ropstenAddress = '0x27105356F6C1ede0e92020e6225E46DC1F496b81'

export const sampleSetFromRawTrx = {
  to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
  value: 10000,
  //  data: '0x00',
  //  gasPrice: '0x00',
  //  gasLimit: '0x00',
}
;(async () => {
  try {
    // const tx = new EthereumJsTx({
    //   gasPrice: web3.utils.toHex(web3.utils.toWei('4', 'gwei')),
    //   gasLimit: 400000,
    //   to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
    //   value: 10000,
    // })
    // tx.sign(Buffer.from(ropstenPrivate, 'hex'))
    // const raw = `0x${tx.serialize().toString('hex')}`
    // web3.eth.sendSignedTransaction(raw)

    // // --> Get block error
    // const block = await web3.eth.getBlock(773003562)
    // console.log(block)

    // --> Exceeded resource error
    const nonce = toEthBuffer(await web3.eth.getTransactionCount(addPrefixToHex(ropstenAddress), 'pending'))
    const tx = new EthereumJsTx(
      {
        nonce,
        gasPrice: web3.utils.toHex(web3.utils.toWei('4', 'gwei')),
        gasLimit: 400000,
        to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
        value: web3.utils.toHex(web3.utils.toWei('4', 'ether')),
      },
      { hardfork: 'istanbul', chain: 'ropsten' },
    )
    tx.sign(Buffer.from(ropstenPrivate, 'hex'))
    const raw = `0x${tx.serialize().toString('hex')}`
    web3.eth.sendSignedTransaction(raw)
  } catch (error) {
    console.log(error)
  }
})()
