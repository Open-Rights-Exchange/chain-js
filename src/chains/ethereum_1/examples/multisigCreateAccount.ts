/* eslint-disable no-console */
/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */

import { connectChain, goerliChainOptions, goerliEndpoints } from './helpers/networks'

import { EthereumGnosisMultisigCreateAccountOptions } from '../plugins/multisig/gnosisSafeV1/models'
import { toEthereumAddress } from '../helpers'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafeV1/plugin'

require('dotenv').config()
;(async () => {
  try {
    const goerli = await connectChain(goerliEndpoints, goerliChainOptions)
    // address with nonce 0: 0x6E94F570f5639bAb0DD3d9ab050CAf1Ad45BB764
    const multisigOptions: EthereumGnosisMultisigCreateAccountOptions = {
      owners: [
        toEthereumAddress(process.env.GOERLI_multisigOwner_1),
        toEthereumAddress(process.env.GOERLI_multisigOwner_3),
        toEthereumAddress(process.env.GOERLI_multisigOwner_2),
      ],
      threshold: 2,
      saltNonce: 1, // you can't create the multisig account more than once unless you increment the nonce (otherwise you'll see a "reason: 'Create2 call failed'"" error from Gnosis)
    }

    const gnosisSafePlugin = new GnosisSafeMultisigPlugin()

    const pluginOptions = {}
    await goerli.installPlugin(gnosisSafePlugin, pluginOptions) // auto init the plugin
    // await gnosisSafePlugin.init(pluginOptions)

    const createAccount = await goerli.new.CreateAccount({ multisigOptions })
    console.log('accountName: ', createAccount.accountName)

    if (createAccount.supportsTransactionToCreateAccount) {
      await createAccount.composeTransaction()
      console.log('IsMultisig: ', createAccount.transaction.isMultisig)
      console.log('createAccount.transaction: ', createAccount.transaction.toJson())
      // await createAccount.transaction.sign([toEthereumPrivateKey(process.env.GOERLI_multisigOwner_1_PRIVATE_KEY)])
      // console.log('Txresult: ', await createAccount.transaction.send())
    }
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
