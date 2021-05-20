/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import { ConfirmType, TxExecutionPriority } from '../../../models'
import { EthereumTransactionOptions } from '../models'
import { toEthereumPrivateKey, toEthereumTxData, toEthUnit } from '../helpers'
import { connectChain, goerliChainOptions, goerliEndpoints } from './helpers/networks'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafeV1/multisigGnosisSafe'
import { EthereumGnosisPluginInput } from '../plugins/multisig/gnosisSafeV1/models'

require('dotenv').config()
// eslint-disable-next-line import/newline-after-import
;(async () => {
  try {
    const multisigPluginInput: EthereumGnosisPluginInput = {
      multisigAddress: '0x6E94F570f5639bAb0DD3d9ab050CAf1Ad45BB764',
    }

    const gnosisSafePlugin = new GnosisSafeMultisigPlugin()

    const goerli = await connectChain(goerliEndpoints, goerliChainOptions)

    await goerli.installPlugin(gnosisSafePlugin)

    const transactionOptions: EthereumTransactionOptions = {
      chain: 'goerli',
      hardfork: 'istanbul',
      executionPriority: TxExecutionPriority.Fast,
      multisigPluginInput,
    }

    const sampleSetFromRawTrx = {
      to: '0xA200c9fe7F747E10dBccA5f85A0A126c9bffe400',
      // from: '0xfE331024D0D8b1C41B6d6203426f4B717E5C8aF3',
      value: 2000,
      gasLimit: 100000,
    } // =>  // data: 0x... All safe transaction data

    const transaction = goerli.new.Transaction(transactionOptions)

    await transaction.setFromRaw(sampleSetFromRawTrx)

    await transaction.prepareToBeSigned()
    console.log('Beforevalidate')
    await transaction.validate()

    console.log('owners: ', transaction.multisigPlugin.owners)
    console.log('threshold: ', transaction.multisigPlugin.threshold)

    await transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_3_PRIVATE_KEY)])
    await transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_1_PRIVATE_KEY)])
    // await transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_2_PRIVATE_KEY)])

    console.log('signatures: ', transaction.multisigPlugin.signatures)
    console.log('missing signatures: ', transaction.missingSignatures)
    console.log('safeTransaction: ', (transaction.multisigPlugin as GnosisSafeMultisigPlugin).safeTransaction)
    // console.log('Transaction: ', transaction.toJson())
    console.log('Trx result: ', await transaction.send())
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
