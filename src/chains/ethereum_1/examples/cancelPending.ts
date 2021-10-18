/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { ChainEthereumV1 } from '../ChainEthereumV1'
import { EthereumChainEndpoint, EthereumChainSettings } from '../models'
import { asyncForEach, sleep } from '../../../helpers'
import { TxExecutionPriority } from '../../../models'
import { toEthereumPrivateKey } from '../helpers'

require('dotenv').config()

const { env } = process

const ropstenEndpoints: EthereumChainEndpoint[] = [
  {
    url: 'https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
  },
]

function range(start: number, step: number) {
  return Array.apply(0, Array(step)).map((element: number, index: number) => index + start)
}

const ropstenChainOptions: EthereumChainSettings = {
  chainForkType: {
    chainName: 'ropsten',
    hardFork: 'istanbul',
  },
  defaultTransactionSettings: {
    maxFeeIncreasePercentage: 20,
    executionPriority: TxExecutionPriority.Fast,
  },
}

// address (and matching private key) to cancel all pending transactions for - replace with your address
const accountToCancelFor = env.ROPSTEN_erc20acc
const privateKeyForCancelAccount = env.ROPSTEN_erc20acc_PRIVATE_KEY as any
;(async () => {
  try {
    const ethChain = new ChainFactory().create(
      ChainType.EthereumV1,
      ropstenEndpoints,
      ropstenChainOptions,
    ) as ChainEthereumV1
    await ethChain.connect()
    const highestNonceExecuted = await ethChain.web3.eth.getTransactionCount(accountToCancelFor, 'latest')
    const highestNoncePending = await ethChain.web3.eth.getTransactionCount(accountToCancelFor, 'pending')
    console.log('last nonce executed: ', highestNonceExecuted)
    console.log('highest nonce pending: ', highestNoncePending)
    const cancelationTrx = {
      from: accountToCancelFor,
      to: accountToCancelFor,
      amount: 0,
    }
    if (highestNoncePending > highestNonceExecuted) {
      console.log(`cancelling ${highestNoncePending - highestNonceExecuted} pending transactions`)
      const nonceRange = range(highestNonceExecuted, highestNoncePending - highestNonceExecuted)
      await asyncForEach(nonceRange, async nonce => {
        const transaction = await ethChain.new.Transaction()
        await transaction.setTransaction({ ...cancelationTrx, nonce })
        const fee = await transaction.getSuggestedFee(TxExecutionPriority.Fast)
        await transaction.setDesiredFee(fee)
        await transaction.validate()
        await transaction.prepareToBeSigned()
        await transaction.sign([toEthereumPrivateKey(privateKeyForCancelAccount)])
        try {
          console.log('transaction sent: ', await transaction.send())
        } catch (err) {
          console.log(err)
        }
        sleep(500)
      })
    }
    console.log('no pending')
  } catch (error) {
    console.log(error)
  }
})()
