/* eslint-disable no-console */
/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */

import {
  connectChain,
  // goerliChainOptions,
  // goerliEndpoints,
  ropstenChainOptions,
  ropstenEndpoints,
} from './helpers/networks'

import { EthereumGnosisMultisigCreateAccountOptions } from '../plugins/multisig/gnosisSafeV1/models'
import { toEthereumAddress, toEthereumPrivateKey } from '../helpers'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafeV1/plugin'

require('dotenv').config()
;(async () => {
  try {
    const ropsten = await connectChain(ropstenEndpoints, ropstenChainOptions)
    // address with nonce 0: 0x6E94F570f5639bAb0DD3d9ab050CAf1Ad45BB764
    const multisigOptions: EthereumGnosisMultisigCreateAccountOptions = {
      owners: [
        toEthereumAddress(process.env.TESTNET_multisigOwner_1),
        toEthereumAddress(process.env.TESTNET_multisigOwner_3),
        toEthereumAddress(process.env.TESTNET_multisigOwner_2),
      ],
      threshold: 2,
      saltNonce: 3, // you can't create the multisig account more than once unless you increment the nonce (otherwise you'll see a "reason: 'Create2 call failed'"" error from Gnosis)
    }

    const gnosisSafePlugin = new GnosisSafeMultisigPlugin()

    const pluginOptions = {}
    await ropsten.installPlugin(gnosisSafePlugin, pluginOptions) // auto init the plugin
    await gnosisSafePlugin.init(pluginOptions)

    const createAccount = await ropsten.new.CreateAccount({ multisigOptions })
    console.log('accountName: ', createAccount.accountName)

    if (createAccount.supportsTransactionToCreateAccount) {
      await createAccount.composeTransaction()
      console.log('IsMultisig: ', createAccount.transaction.isMultisig)
      // Must sign parent Transaction with any of the multisig account private keys - this signer pays the fees
      await createAccount.transaction.sign([toEthereumPrivateKey(process.env.TESTNET_multisigOwner_1_PRIVATE_KEY)])
      console.log('createAccount.transaction: ', createAccount.transaction.toJson())
      console.log('Txresult: ', await createAccount.transaction.send())
    }
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()