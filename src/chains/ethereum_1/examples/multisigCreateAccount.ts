/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */

import { connectChain, goerliChainOptions, goerliEndpoints } from './helpers/networks'
import {
  DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS,
  DEFAULT_PROXY_FACTORY_ADDRESS,
  DEFAULT_FALLBACK_HANDLER_ADDRESS,
} from '../ethConstants'
import { EthereumGnosisSafeMultisigOptions } from '../plugins/multisig/gnosisSafe/models'
import { toEthereumPrivateKey } from '../helpers'

require('dotenv').config()
;(async () => {
  try {
    const goerli = await connectChain(goerliEndpoints, goerliChainOptions)
    // deterministic address: 0x3269AEa53C23E496292259F51e24725D0fBa78A2
    const multisigOptions: EthereumGnosisSafeMultisigOptions = {
      addrs: [
        process.env.GOERLI_multisigOwner_1,
        process.env.GOERLI_multisigOwner_3,
        process.env.GOERLI_multisigOwner_2,
      ],
      weight: 3,
      pluginOptions: {
        nonce: 1,
        chainUrl: goerliEndpoints[0].url,
        gnosisSafeMasterAddress: DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS,
        proxyFactoryAddress: DEFAULT_PROXY_FACTORY_ADDRESS,
        fallbackHandlerAddress: DEFAULT_FALLBACK_HANDLER_ADDRESS,
        // initializerAction?: InitializerAction;
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
      await createAccount.transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_1_PRIVATE_KEY)])
      console.log('Txresult: ', await createAccount.transaction.send())
    }
    console.log('createAccountTransaction: ', createAccount.transaction.actions)
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
