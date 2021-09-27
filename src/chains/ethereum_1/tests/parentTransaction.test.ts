import { EthereumTransaction } from '../ethTransaction'
import { connectChain, ropstenChainOptions, ropstenEndpoints } from '../examples/helpers/networks'
import { toEthereumAddress, toEthereumPrivateKey } from '../helpers'
import { EthereumTransactionOptions } from '../models'
import { EthereumGnosisMultisigTransactionOptions } from '../plugins/multisig/gnosisSafeV1/models'
import { GnosisSafeMultisigPlugin } from '../plugins/multisig/gnosisSafeV1/plugin'

jest.setTimeout(30000)

// const multisigOwner = '0x31DF49653c72933A4b99aF6fb5d5b77Cc169346a'
const multisigOwnerPrivateKey = '0xbafee378c528ac180d309760f24378a2cfe47d175691966d15c83948e4a7faa6'

// const multisigOwner2 = '0x76d1b5dCFE51dbeB3C489977Faf2643272AaD901'
const multisigOwnerPrivateKey2 = '0x9c58fafab2feb46838efdba78e108d2be13ec0064496889677f32044acf0bbc6'

describe('Ethereum ParentTransaction Tests', () => {
  const multisigOptions: EthereumGnosisMultisigTransactionOptions = {
    multisigAddress: toEthereumAddress('0xE5B218cc277BB9907d91B3B8695931963b411f2A'), // 0x6E94F570f5639bAb0DD3d9ab050CAf1Ad45BB764 for goerli
  }
  const transactionOptions: EthereumTransactionOptions<EthereumGnosisMultisigTransactionOptions> = {
    chain: 'ropsten',
    hardfork: 'istanbul',
    multisigOptions,
  }
  const sampleAction = {
    to: toEthereumAddress('0xA200c9fe7F747E10dBccA5f85A0A126c9bffe400'),
    // from: '0xfE331024D0D8b1C41B6d6203426f4B717E5C8aF3',
    value: 2000,
    gasLimit: '1000000',
  }
  const gnosisSafePlugin = new GnosisSafeMultisigPlugin()

  let transaction: EthereumTransaction

  it('parentRawTransaction should be undefined when there is missingSignatures', async () => {
    const ropsten = await connectChain(ropstenEndpoints, ropstenChainOptions)
    await ropsten.installPlugin(gnosisSafePlugin)

    transaction = await ropsten.new.Transaction(transactionOptions)

    transaction.actions = [sampleAction]

    await transaction.prepareToBeSigned()
    await transaction.validate()

    await transaction.sign([toEthereumPrivateKey(multisigOwnerPrivateKey)])

    const stringifiedMissingSignatures = JSON.stringify([
      '0x1A70f07994876922b07e596d3940f8a81bb093A4',
      '0x76d1b5dCFE51dbeB3C489977Faf2643272AaD901',
    ])
    expect(JSON.stringify(transaction.missingSignatures)).toBe(stringifiedMissingSignatures)
    expect(transaction.multisigTransaction.parentRawTransaction).toBeUndefined()

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const value = transaction.parentTransaction // must wrap property in func for Jest to catch
    }).toThrow('ParentTransaction is not yet set')
  })
  it('generate and return rawTransaction when no missing signatures', async () => {
    await transaction.sign([toEthereumPrivateKey(multisigOwnerPrivateKey2)])

    expect(transaction.missingSignatures).toBeNull()
    expect(transaction.multisigTransaction.parentRawTransaction).toBeTruthy()
    expect(transaction.parentTransaction).toBeInstanceOf(EthereumTransaction)
  })
})
