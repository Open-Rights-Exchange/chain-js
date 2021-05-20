/* eslint-disable no-console */
/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */

import { connectChain, goerliChainOptions, goerliEndpoints } from './helpers/networks'

import { EthereumGnosisPluginInput } from '../plugins/multisig/gnosisSafeV1/models'
import { toEthereumPrivateKey } from '../helpers'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafeV1/multisigGnosisSafe'

require('dotenv').config()
;(async () => {
  try {
    const goerli = await connectChain(goerliEndpoints, goerliChainOptions)
    // address with nonce 0: 0x6E94F570f5639bAb0DD3d9ab050CAf1Ad45BB764
    const multisigPluginInput: EthereumGnosisPluginInput = {
      createAccountOptions: {
        owners: [
          process.env.GOERLI_multisigOwner_1,
          process.env.GOERLI_multisigOwner_3,
          process.env.GOERLI_multisigOwner_2,
        ],
        threshold: 2,
        nonce: 3,
      },
    }

    const gnosisSafePlugin = new GnosisSafeMultisigPlugin()

    await goerli.installPlugin(gnosisSafePlugin)

    const createAccount = goerli.new.CreateAccount({ multisigPluginInput })
    await createAccount.generateKeysIfNeeded()
    console.log('accountName: ', createAccount.accountName)
    if (createAccount.supportsTransactionToCreateAccount) {
      await createAccount.composeTransaction()
      console.log('IsMultisig: ', createAccount.transaction.isMultisig)
      console.log('createAccount.transaction: ', createAccount.transaction.toJson())
      await createAccount.transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_1_PRIVATE_KEY)])
      console.log('Txresult: ', await createAccount.transaction.send())
    }
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
