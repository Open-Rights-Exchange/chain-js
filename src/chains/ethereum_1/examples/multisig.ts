/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import { ConfirmType } from '../../../models'
import { EthereumTransactionOptions } from '../models'
import { toEthereumPrivateKey, toEthereumTxData, toEthUnit } from '../helpers'
import { connectChain, goerliChainOptions, goerliEndpoints } from './helpers/networks'
import {
  DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS,
  DEFAULT_PROXY_FACTORY_ADDRESS,
  DEFAULT_FALLBACK_HANDLER_ADDRESS,
} from '../ethConstants'

import { EthereumGnosisSafeMultisigOptions } from '../plugins/gnosisSafe/models'
import { GnosisSafeMultisigPlugin } from '../plugins/gnosisSafe/multisigGnosisSafe'
// eslint-disable-next-line import/newline-after-import
;(async () => {
  try {
    const goerli = await connectChain(goerliEndpoints, goerliChainOptions)
    const multisigOptions: EthereumGnosisSafeMultisigOptions = {
      addrs: ['0x31DF49653c72933A4b99aF6fb5d5b77Cc169346a', '0x76d1b5dCFE51dbeB3C489977Faf2643272AaD901'],
      weight: 2,
      pluginOptions: {
        chainUrl: goerliEndpoints[0].url,
        multisigAddress: '0x1Fa8f05dEA1F77c9D9AEb7A29C812871810501E0',
      },
    }

    const defaultEthTxOptions: EthereumTransactionOptions = {
      chain: 'ropsten',
      hardfork: 'istanbul',
      multisigOptions,
    }

    const sampleSetFromRawTrx = {
      to: '0xA200c9fe7F747E10dBccA5f85A0A126c9bffe400',
      // from: '0xfE331024D0D8b1C41B6d6203426f4B717E5C8aF3',
      value: 100,
      data: toEthereumTxData('0x00'),
      gasLimit: 100000,
    }

    const transaction = goerli.new.Transaction(defaultEthTxOptions)
    console.log('1:')
    await transaction.setFromRaw(sampleSetFromRawTrx)
    console.log('2:')
    await transaction.prepareToBeSigned()
    console.log('3:')
    await transaction.validate()
    console.log('multisigRaw:', transaction.multisigPlugin?.rawTransaction)
    console.log('transaction action: ', transaction.actions)
    await transaction.sign([toEthereumPrivateKey('0xbafee378c528ac180d309760f24378a2cfe47d175691966d15c83948e4a7faa6')])
    console.log('multisigRaw:', transaction.multisigPlugin?.rawTransaction)
    console.log('EthereumJsTx : ', transaction.raw)
    await transaction.sign([toEthereumPrivateKey('0x9c58fafab2feb46838efdba78e108d2be13ec0064496889677f32044acf0bbc6')])
    console.log('multisigRaw:', transaction.multisigPlugin?.rawTransaction)
    console.log('EthereumJsTx : ', transaction.raw)
    console.log('Missing multisig signatures: ', transaction.multisigPlugin.missingSignatures)
    console.log('Missing parent trx signatures: ', transaction.missingSignatures)

    console.log('owners: ', await (transaction.multisigPlugin as GnosisSafeMultisigPlugin).multisigContract.getOwners())
    console.log('Trx result: ', await transaction.send())
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()

enum MultisigPlugins {
  GNOSIS = 'gnosis',
}

type MultisigMetadata = {
  plugin: MultisigPlugins
  accounts: string[]
  threshold: number
  version: number
}

// deploying "SimulateTxAccessor" (tx: 0x341b4eacab0898ccc7b2d013d043c1e9fdd86d7a5f28d227aace42653e0a20bf)...: deployed at 0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da with 237871 gas
// deploying "GnosisSafeProxyFactory" (tx: 0x82824944303b72729708bf393e5d40b16ec52c8009c545642dd14e7265a21982)...: deployed at 0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2 with 867594 gas
// deploying "DefaultCallbackHandler" (tx: 0xeff00220c50a4f670dcd1e690af7fa5dcc5e559dc65b613033f978803bc77879)...: deployed at 0x1AC114C2099aFAf5261731655Dc6c306bFcd4Dbd with 542473 gas
// deploying "CompatibilityFallbackHandler" (tx: 0xf435072baa9365f0d921ccdc2d3a3da39625ee0151604c22ef2dd40d0014ca52)...: deployed at 0xD6A0d7cC26a124B17c083a18e6D8eCEa605f60D0 with 1072345 gas
// deploying "CreateCall" (tx: 0xb689ce67cf60b65d0cc03ce5990bd79f7a70aef1de8c75c4b8174b5561af1e63)...: deployed at 0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4 with 294718 gas
// deploying "MultiSend" (tx: 0x773b650b7c46f760d4835a40fd07c011a766f3e0886908f8ae4b9372e9a9aca0)...: deployed at 0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761 with 190004 gas
// deploying "MultiSendCallOnly" (tx: 0xfb41b9b58ebe3ea7ffda57e4ef501bb37bf9b038c52b7368c9d0baed4f08335d)...: deployed at 0x40A2aCCbd92BCA938b02010E17A5b8929b49130D with 142122 gas
// deploying "GnosisSafeL2" (tx: 0x7dd5b6b6b0d42b520a2ef55f87e41616ea29ab80a38c7f24d5835291eac39bd3)...: deployed at 0x212Fa641B5B45740eb2f7C5C48D16aE9b42f48e2 with 5333845 gas
// deploying "GnosisSafe" (tx: 0x4b68be0f6ff5e4d23f26777d9143bcff99678023c27c885f75c7649ef6c27d2d)...: deployed at 0x78d90417212699bfD236aefCc6740dD0A27DA0Ae with 5151414 gas
