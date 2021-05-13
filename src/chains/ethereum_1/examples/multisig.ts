/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import { ConfirmType } from '../../../models'
import { EthereumTransactionOptions } from '../models'
import { toEthereumPrivateKey, toEthereumTxData, toEthUnit } from '../helpers'
import { connectChain, goerliChainOptions, goerliEndpoints } from './helpers/networks'
import { EthereumGnosisSafeMultisigOptions } from '../plugins/multisig/gnosisSafe/models'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafe/multisigGnosisSafe'

require('dotenv').config()
// eslint-disable-next-line import/newline-after-import
;(async () => {
  try {
    const goerli = await connectChain(goerliEndpoints, goerliChainOptions)
    const multisigOptions: EthereumGnosisSafeMultisigOptions = {
      addrs: [
        process.env.GOERLI_multisigOwner_1,
        process.env.GOERLI_multisigOwner_2,
        process.env.GOERLI_multisigOwner_3,
      ],
      weight: 3,
      pluginOptions: {
        chainUrl: goerliEndpoints[0].url,
        multisigAddress: '0x27a63160DE11166FA5c0D4eFFB604c61C797e393',
      },
    }

    const defaultEthTxOptions: EthereumTransactionOptions = {
      chain: 'goerli',
      hardfork: 'istanbul',
      multisigOptions,
    }

    const sampleSetFromRawTrx = {
      to: '0xA200c9fe7F747E10dBccA5f85A0A126c9bffe400',
      // from: '0xfE331024D0D8b1C41B6d6203426f4B717E5C8aF3',
      value: 10000,
      // data: toEthereumTxData('0x00'),
      gasLimit: 100000,
    } // =>  // data: 0x... All safe transaction data

    const transaction = goerli.new.Transaction(defaultEthTxOptions)

    await transaction.setFromRaw(sampleSetFromRawTrx)

    await transaction.prepareToBeSigned()
    console.log('Beforevalidate')
    await transaction.validate()

    console.log('owners: ', await (transaction.multisigPlugin as GnosisSafeMultisigPlugin).multisigContract.getOwners())

    await transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_3_PRIVATE_KEY)])
    await transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_1_PRIVATE_KEY)])
    await transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_2_PRIVATE_KEY)])

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
