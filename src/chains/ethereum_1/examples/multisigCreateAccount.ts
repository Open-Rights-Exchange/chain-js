/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */

import { connectChain, goerliChainOptions, goerliEndpoints } from './helpers/networks'
import {
  DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS,
  DEFAULT_PROXY_FACTORY_ADDRESS,
  DEFAULT_FALLBACK_HANDLER_ADDRESS,
} from '../ethConstants'
import { EthereumGnosisSafeMultisigOptions } from '../plugins/gnosisSafe/models'
import { toEthereumPrivateKey } from '../helpers'
;(async () => {
  try {
    const goerli = await connectChain(goerliEndpoints, goerliChainOptions)
    const multisigOptions: EthereumGnosisSafeMultisigOptions = {
      addrs: ['0x31DF49653c72933A4b99aF6fb5d5b77Cc169346a', '0x76d1b5dCFE51dbeB3C489977Faf2643272AaD901'],
      weight: 2,
      pluginOptions: {
        nonce: 10,
        chainUrl: goerliEndpoints[0].url,
        gnosisSafeMasterAddress: DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS,
        proxyFactoryAddress: DEFAULT_PROXY_FACTORY_ADDRESS,
        fallbackHandlerAddress: DEFAULT_FALLBACK_HANDLER_ADDRESS,
        // initializerAction?: InitializerAction;
        // operation?: number;
        // refundReceiver?: string;
        // safeTxGas?: number | string;
        // baseGas?: number | string;
        // gasPrice?: number | string;
        // gasToken?: string;
      },
    }

    const createAccountOptions = {
      multisigOptions,
    }

    const createAccount = goerli.new.CreateAccount(createAccountOptions)
    console.log('1:')
    await createAccount.generateKeysIfNeeded()
    console.log('accountName: ', createAccount.accountName)
    if (createAccount.supportsTransactionToCreateAccount) {
      await createAccount.composeTransaction()
      console.log('IsMultisig: ', createAccount.transaction.isMultisig)
      console.log('createAccount.transaction: ', createAccount.transaction.toJson())
      await createAccount.transaction.sign([
        toEthereumPrivateKey('0x9c58fafab2feb46838efdba78e108d2be13ec0064496889677f32044acf0bbc6'),
      ])
      console.log('Txresult: ', await createAccount.transaction.send())
    }
    console.log('createAccountTransaction: ', createAccount.transaction.actions)
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
