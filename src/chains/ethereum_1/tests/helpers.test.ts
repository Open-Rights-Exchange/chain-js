// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { ZERO_HEX, EMPTY_HEX, ZERO_ADDRESS } from '../ethConstants'
import { toWei, toEthereumAddress, toEthereumPrivateKey, ethereumTrxArgIsNullOrEmpty } from '../helpers'
import { EthUnit } from '../models'

describe('Ethereum Helper Functions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('tests toWei', async () => {
    const expValue = toWei(100, EthUnit.Milliether)
    const value = toWei(100, EthUnit.Finney)

    expect(value).toEqual(expValue)
  })

  it('tests toEthereumAddress', async () => {
    const expValue = '0x27105356F6C1ede0e92020e6225E46DC1F496b81'
    const value = '27105356F6C1ede0e92020e6225E46DC1F496b81'

    expect(toEthereumAddress(value)).toEqual(expValue)
  })

  it('tests toEthereumPrivateKey', async () => {
    const expValue = '0x12a1a5e255f23853aeac0581e7e5615433de9817cc5a455c8230bd4f91a03bbb'
    const value = '12a1a5e255f23853aeac0581e7e5615433de9817cc5a455c8230bd4f91a03bbb'

    expect(toEthereumPrivateKey(value)).toEqual(expValue)
  })

  it('tests ethereumTrxArgIsNullOrEmpty', async () => {
    expect(ethereumTrxArgIsNullOrEmpty('0x123')).toEqual(false)
    expect(ethereumTrxArgIsNullOrEmpty(0)).toEqual(true)
    expect(ethereumTrxArgIsNullOrEmpty(ZERO_HEX)).toEqual(true)
    expect(ethereumTrxArgIsNullOrEmpty(EMPTY_HEX)).toEqual(true)
    expect(ethereumTrxArgIsNullOrEmpty(ZERO_ADDRESS)).toEqual(true)
    expect(ethereumTrxArgIsNullOrEmpty(Buffer.from(ZERO_HEX, 'hex'))).toEqual(true)
  })
})
