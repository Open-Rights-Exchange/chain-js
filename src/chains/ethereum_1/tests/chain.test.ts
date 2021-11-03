/* eslint-disable no-console */
// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { toChainEntityName } from '../../../helpers'
import { ChainType } from '../../..'
import { ropstenEndpoints } from '../examples/helpers/networks'
import { toEthereumSymbol } from '../helpers'
import { ChainFactory } from '../../../chainFactory'
import { Chain } from '../../../interfaces'

describe('Ethereum Helper Functions', () => {
  let ropsten: Chain
  beforeAll(async () => {
    ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
    await ropsten.connect()
  })
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('Get Native Balance', async () => {
    const balance = await ropsten.fetchBalance(
      toChainEntityName('0xA2910d9b2Bd0Bdc1DfCCDDAd532680b167Df1894'),
      toEthereumSymbol('eth'),
    )
    console.log('Eth Balance: ', balance)
    expect(balance).toBeTruthy()
  })

  it('get erc20 Balance', async () => {
    const balance = await ropsten.fetchBalance(
      toChainEntityName('0xb83339d874f27b7e74dc188bd6b2a51a1167946c'),
      toEthereumSymbol('AQA'),
      '0x9699f68bebf4b360d9a529523d7d6d23b6f52d44',
    )
    console.log('ERC20 Token Balance: ', balance)
    expect(balance).toBeTruthy()
  })
})
