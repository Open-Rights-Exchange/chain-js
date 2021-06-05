/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import { ConfirmType, TxExecutionPriority } from '../../../models'
import { EthereumTransactionOptions } from '../models'
import { toEthereumAddress, toEthereumPrivateKey, toEthereumTxData, toEthUnit } from '../helpers'
import {
  connectChain,
  goerliChainOptions,
  goerliEndpoints,
  ropstenChainOptions,
  ropstenEndpoints,
} from './helpers/networks'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafeV1/plugin'
import { EthereumGnosisMultisigTransactionOptions } from '../plugins/multisig/gnosisSafeV1/models'
import { GnosisSafeMultisigPluginTransaction } from '../plugins/multisig/gnosisSafeV1/transaction'

require('dotenv').config()
// eslint-disable-next-line import/newline-after-import
;(async () => {
  try {
    const multisigOptions: EthereumGnosisMultisigTransactionOptions = {
      multisigAddress: toEthereumAddress('0xE5B218cc277BB9907d91B3B8695931963b411f2A'),
    }

    const gnosisSafePlugin = new GnosisSafeMultisigPlugin()

    const ropsten = await connectChain(ropstenEndpoints, ropstenChainOptions)

    await ropsten.installPlugin(gnosisSafePlugin)

    const transactionOptions: EthereumTransactionOptions<EthereumGnosisMultisigTransactionOptions> = {
      chain: 'ropsten',
      hardfork: 'istanbul',
      executionPriority: TxExecutionPriority.Fast,
      multisigOptions,
    }

    const sampleSetFromRawTrx = {
      to: toEthereumAddress('0xA200c9fe7F747E10dBccA5f85A0A126c9bffe400'),
      // from: '0xfE331024D0D8b1C41B6d6203426f4B717E5C8aF3',
      value: 2000,
      gasLimit: 100000,
    } // =>  // data: 0x... All safe transaction data

    const transaction = await ropsten.new.Transaction(transactionOptions)

    await transaction.setFromRaw(sampleSetFromRawTrx)

    await transaction.prepareToBeSigned()
    await transaction.validate()

    console.log('owners: ', transaction.multisigTransaction.owners)
    console.log('threshold: ', transaction.multisigTransaction.threshold)

    await transaction.sign([toEthereumPrivateKey(process.env.TESTNET_multisigOwner_3_PRIVATE_KEY)])
    // await transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_1_PRIVATE_KEY)])
    await transaction.sign([toEthereumPrivateKey(process.env.TESTNET_multisigOwner_2_PRIVATE_KEY)])

    console.log(
      'signatures: ',
      (transaction.multisigTransaction as GnosisSafeMultisigPluginTransaction).gnosisSignatures,
    )
    console.log('missing signatures: ', transaction.missingSignatures)
    console.log(
      'safeTransaction: ',
      (transaction.multisigTransaction as GnosisSafeMultisigPluginTransaction).rawTransaction,
    )
    console.log(
      'parentTransaction: ',
      (transaction.multisigTransaction as GnosisSafeMultisigPluginTransaction).parentTransaction,
    )
    // console.log('Transaction: ', transaction.toJson())
    let txToSend = transaction
    if (transaction.requiresParentTransaction) {
      txToSend = await transaction.getParentTransaction()
      // Must sign parent Transaction with any of the multisig account private keys - this signer pays the fees
      await txToSend.sign([toEthereumPrivateKey(process.env.TESTNET_multisigOwner_1_PRIVATE_KEY)])
      console.log('Cost', await txToSend.getEstimatedCost())
      console.log('ParentTransaction: ', txToSend.actions[0])
    }
    console.log('Trx result: ', await txToSend.send())
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
