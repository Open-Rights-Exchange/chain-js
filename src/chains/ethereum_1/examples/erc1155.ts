/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import { ConfirmType, TxExecutionPriority } from '../../../models'
import { EthereumTransactionAction, EthereumTransactionOptions } from '../models'
import { toEthereumAddress, toEthereumPrivateKey, toEthereumTxData, toEthUnit } from '../helpers'
import { connectChain, ropstenChainOptions, ropstenEndpoints } from './helpers/networks'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafeV1/plugin'
import { EthereumGnosisMultisigTransactionOptions } from '../plugins/multisig/gnosisSafeV1/models'
import { GnosisSafeMultisigPluginTransaction } from '../plugins/multisig/gnosisSafeV1/transaction'
import { ABI } from './ABIs/erc1155'

require('dotenv').config()
// eslint-disable-next-line import/newline-after-import
;(async () => {
  try {
    const ropsten = await connectChain(ropstenEndpoints, ropstenChainOptions)
    const gnosisSafePlugin = new GnosisSafeMultisigPlugin()
    await ropsten.installPlugin(gnosisSafePlugin)

    // ropsten multisig account that accepts erc1155 token
    const multisigAddress = toEthereumAddress('0xD472Aca4EeA9ED60186ce34D92646A854AfBa1db')

    const transactionOptions: EthereumTransactionOptions<EthereumGnosisMultisigTransactionOptions> = {
      chain: 'ropsten',
      hardfork: 'istanbul',
      executionPriority: TxExecutionPriority.Fast,
    }

    const transferActionA: EthereumTransactionAction = {
      to: toEthereumAddress('0x9d124d26b03A847edE6DA4094823f398544e2ba7'),
      contract: {
        abi: ABI,
        method: 'safeTransferFrom',
        parameters: [process.env.TESTNET_multisigOwner_1, multisigAddress, 1, 1, '0x'],
      },
      gasLimit: '1000000',
    }

    const multisigOptions: EthereumGnosisMultisigTransactionOptions = {
      multisigAddress, // 0x6E94F570f5639bAb0DD3d9ab050CAf1Ad45BB764 for goerli
    }

    const transferActionB: EthereumTransactionAction = {
      to: toEthereumAddress('0x9d124d26b03A847edE6DA4094823f398544e2ba7'),
      contract: {
        abi: ABI,
        method: 'safeTransferFrom',
        parameters: [multisigAddress, process.env.TESTNET_multisigOwner_1, 1, 1, '0x'],
      },
      gasLimit: '1000000',
    }

    const transactionA = await ropsten.new.Transaction(transactionOptions)
    transactionA.actions = [transferActionA]
    await transactionA.prepareToBeSigned()
    await transactionA.validate()
    console.log('TransactionA: ', transactionA.toJson())
    await transactionA.sign([toEthereumPrivateKey(process.env.TESTNET_multisigOwner_1_PRIVATE_KEY)])
    console.log('missing signatures: ', transactionA.missingSignatures)
    console.log('Trx result: ', await transactionA.send())

    const transactionBMultisig = await ropsten.new.Transaction({ ...transactionOptions, multisigOptions })
    transactionBMultisig.actions = [transferActionB]
    await transactionBMultisig.prepareToBeSigned()
    await transactionBMultisig.validate()
    console.log('TransactionB: ', transactionBMultisig.toJson())
    await transactionBMultisig.sign([toEthereumPrivateKey(process.env.TESTNET_multisigOwner_3_PRIVATE_KEY)])
    await transactionBMultisig.sign([toEthereumPrivateKey(process.env.TESTNET_multisigOwner_2_PRIVATE_KEY)])
    let txToSend = transactionBMultisig
    if (transactionBMultisig.requiresParentTransaction) {
      txToSend = await transactionBMultisig.getParentTransaction()
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
