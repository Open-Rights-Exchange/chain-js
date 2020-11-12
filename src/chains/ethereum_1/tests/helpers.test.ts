// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { ZERO_HEX, EMPTY_HEX, ZERO_ADDRESS } from '../ethConstants'
import { toWeiBN, toEthereumAddress, toEthereumPrivateKey, isNullOrEmptyEthereumValue } from '../helpers'
import { EthUnit } from '../models'

describe('Ethereum Helper Functions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('tests toWei', async () => {
    const expValue = toWeiBN(100, EthUnit.Milliether)
    const value = toWeiBN(100, EthUnit.Finney)

    expect(value).toEqual(expValue)
  })

  it('tests toEthereumAddress', async () => {
    const expValue = '0x27105356f6c1ede0e92020e6225e46dc1f496b81'
    const value = '27105356F6C1ede0e92020e6225E46DC1F496b81'

    expect(toEthereumAddress(value)).toEqual(expValue)
  })

  it('tests toEthereumPrivateKey', async () => {
    const expValue = '12a1a5e255f23853aeac0581e7e5615433de9817cc5a455c8230bd4f91a03bbb'
    const value = '12a1a5e255f23853aeac0581e7e5615433de9817cc5a455c8230bd4f91a03bbb'

    expect(toEthereumPrivateKey(value)).toEqual(expValue)
  })

  it('tests isNullOrEmptyEthereumValue', async () => {
    expect(isNullOrEmptyEthereumValue('0x123')).toEqual(false)
    expect(isNullOrEmptyEthereumValue(0)).toEqual(true)
    expect(isNullOrEmptyEthereumValue(ZERO_HEX)).toEqual(true)
    expect(isNullOrEmptyEthereumValue(EMPTY_HEX)).toEqual(true)
    expect(isNullOrEmptyEthereumValue(ZERO_ADDRESS)).toEqual(true)
    expect(isNullOrEmptyEthereumValue(Buffer.from(ZERO_HEX, 'hex'))).toEqual(true)
  })
})
