// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
// Web3 cannot be used to mock fetch response
// TODO: refactor fect mock to not use eosjs module
import { JsonRpc } from 'eosjs'
import { mapChainError } from '../ethErrors'
import { ChainErrorType } from '../../../models'

describe('Error mapping', () => {
  const endpoint = 'http://localhost'
  const fetchMock = fetch as any
  let jsonRpc: JsonRpc

  beforeEach(() => {
    fetchMock.resetMocks()
    jsonRpc = new JsonRpc(endpoint)
  })

  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('maps a TxExceededResources error', async () => {
    let actErrorType = null
    const expErrorType = ChainErrorType.TxExceededResources

    const expReturn = {
      message: 'Returned error: insufficient funds for gas * price + value',
    }
    fetchMock.once(JSON.stringify(expReturn), { status: 500 })
    try {
      await jsonRpc.get_abi('placeholder')
    } catch (e) {
      // eslint-disable-next-line jest/no-try-expect
      expect(e).toBeInstanceOf(Error)
      console.log(e)
      const mappedError = mapChainError(e)
      actErrorType = mappedError.errorType
    }

    expect(actErrorType).toEqual(expErrorType)
  })
})
